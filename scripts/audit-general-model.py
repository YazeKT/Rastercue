"""Read-only restricted provenance audit; never imports torch or executes a model.

Usage: python scripts/audit-general-model.py LOCAL.bin LOCAL.param CREATOR.pth.url
Checks creator SRVGG PyTorch tensor bytes against existing NCNN FP16 convolutions
and FP32 bias/PReLU arrays, in graph order. Requires only Python standard library.
"""
import collections
import io
import json
import pickle
import struct
import sys
import urllib.request
import zipfile


def rebuild(storage, offset, size, stride, *unused):
    return {"storage": storage, "offset": offset, "size": size, "stride": stride}


class Restricted(pickle.Unpickler):
    def find_class(self, module, name):
        allowed = {
            ("collections", "OrderedDict"): collections.OrderedDict,
            ("torch", "FloatStorage"): "FloatStorage",
            ("torch._utils", "_rebuild_tensor_v2"): rebuild,
            ("torch._utils", "_rebuild_tensor"): rebuild,
        }
        if (module, name) not in allowed:
            raise ValueError(f"Rejected pickle global {module}.{name}")
        return allowed[(module, name)]

    def persistent_load(self, identifier):
        kind, data_type, key, location, length = identifier
        assert kind == "storage" and data_type == "FloatStorage"
        return key, length


def main():
    bin_path, param_path, url = sys.argv[1:]
    assert url.startswith("https://github.com/xinntao/Real-ESRGAN/releases/download/")
    with urllib.request.urlopen(url, timeout=180) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    pickle_name = next(name for name in archive.namelist() if name.endswith("/data.pkl"))
    prefix = pickle_name.removesuffix("data.pkl")
    state = Restricted(io.BytesIO(archive.read(pickle_name))).load()
    assert set(state) <= {"params", "params_ema"}
    state = state.get("params_ema", state.get("params"))
    arrays = []
    for name, tensor in state.items():
        assert name.startswith("body.") and name.endswith((".weight", ".bias"))
        key, storage_count = tensor["storage"]
        count = 1
        expected_stride = 1
        for dimension, stride in zip(reversed(tensor["size"]), reversed(tensor["stride"])):
            assert stride == expected_stride, "Non-contiguous creator tensor"
            expected_stride *= dimension
        for dimension in tensor["size"]:
            count *= dimension
        assert count == storage_count and tensor["offset"] == 0
        raw = archive.read(prefix + "data/" + key)
        assert len(raw) == count * 4
        arrays.append((name, raw, count))
    with open(bin_path, "rb") as handle:
        local = handle.read()
    with open(param_path, encoding="utf-8") as handle:
        lines = handle.read().splitlines()
    offset = 0
    consumed = []
    precision_adapted = []
    def verify_float_array(raw, name):
        actual = local[offset:offset + len(raw)]
        if actual == raw:
            return
        rounded = b"".join(struct.pack("<f", struct.unpack("<e", struct.pack("<e", value[0]))[0]) for value in struct.iter_unpack("<f", raw))
        assert actual == rounded, f"Float array differs beyond FP16 rounding: {name}"
        precision_adapted.append(name)
    for line in lines:
        parts = line.split()
        if not parts or parts[0] not in {"Convolution", "PReLU"}:
            continue
        fields = dict(item.split("=", 1) for item in parts if "=" in item)
        name, raw, count = arrays.pop(0)
        if parts[0] == "Convolution":
            assert fields["1"] == "3" and fields["4"] == "1"
            assert fields.get("3", "1") == "1" and fields.get("2", "1") == "1"
            assert count == int(fields["6"])
            assert struct.unpack_from("<I", local, offset)[0] == 0x01306B47
            offset += 4
            half = b"".join(struct.pack("<e", value[0]) for value in struct.iter_unpack("<f", raw))
            assert local[offset:offset + len(half)] == half, f"Convolution differs: {name}"
            offset += (len(half) + 3) // 4 * 4
            consumed.append(name)
            if fields.get("5") == "1":
                name, raw, count = arrays.pop(0)
                assert count == int(fields["0"])
                verify_float_array(raw, name)
                offset += len(raw)
                consumed.append(name)
        else:
            assert count == int(fields["0"])
            verify_float_array(raw, name)
            offset += len(raw)
            consumed.append(name)
    assert not arrays and offset == len(local), "Unverified trailing weights"
    print(json.dumps({"verified": True, "creator_url": url, "tensors": len(consumed), "bytes_verified": offset, "fp16_rounded_float_arrays": precision_adapted}, indent=2))


if __name__ == "__main__":
    main()
