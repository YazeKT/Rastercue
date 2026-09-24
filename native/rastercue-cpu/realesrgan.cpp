#include "realesrgan.h"

#include <algorithm>
#include <cstdio>
#include <cstring>

RealESRGAN::RealESRGAN(int, bool use_tta, int num_threads)
    : tta_mode(use_tta)
{
    net.opt.num_threads = std::max(1, num_threads);
    net.opt.use_vulkan_compute = false;
    net.opt.use_fp16_packed = true;
    net.opt.use_fp16_storage = false;
    net.opt.use_fp16_arithmetic = false;
    net.opt.use_int8_storage = true;
    net.opt.use_int8_arithmetic = false;
}

RealESRGAN::~RealESRGAN()
{
    ncnn::Layer* layers[] = {bicubic_2x, bicubic_3x, bicubic_4x};
    for (ncnn::Layer* layer : layers)
    {
        if (!layer) continue;
        layer->destroy_pipeline(net.opt);
        delete layer;
    }
}

static ncnn::Layer* make_bicubic(float factor, const ncnn::Option& opt)
{
    ncnn::Layer* layer = ncnn::create_layer("Interp");
    if (!layer) return nullptr;
    ncnn::ParamDict pd;
    pd.set(0, 3);
    pd.set(1, factor);
    pd.set(2, factor);
    layer->load_param(pd);
    layer->create_pipeline(opt);
    return layer;
}

#if _WIN32
int RealESRGAN::load(const std::wstring& parampath, const std::wstring& modelpath)
#else
int RealESRGAN::load(const std::string& parampath, const std::string& modelpath)
#endif
{
#if _WIN32
    FILE* param = _wfopen(parampath.c_str(), L"rb");
    if (!param) { fwprintf(stderr, L"Error: unable to open model parameters %ls\n", parampath.c_str()); return -1; }
    const int param_result = net.load_param(param);
    fclose(param);
    if (param_result != 0) return param_result;

    FILE* model = _wfopen(modelpath.c_str(), L"rb");
    if (!model) { fwprintf(stderr, L"Error: unable to open model weights %ls\n", modelpath.c_str()); return -1; }
    const int model_result = net.load_model(model);
    fclose(model);
    if (model_result != 0) return model_result;
#else
    const int param_result = net.load_param(parampath.c_str());
    if (param_result != 0) return param_result;
    const int model_result = net.load_model(modelpath.c_str());
    if (model_result != 0) return model_result;
#endif

    bicubic_2x = make_bicubic(2.f, net.opt);
    bicubic_3x = make_bicubic(3.f, net.opt);
    bicubic_4x = make_bicubic(4.f, net.opt);
    return bicubic_2x && bicubic_3x && bicubic_4x ? 0 : -1;
}

int RealESRGAN::process(const ncnn::Mat& inimage, ncnn::Mat& outimage) const
{
    if (tta_mode)
    {
        fprintf(stderr, "Error: CPU TTA is not available in this sidecar build. Disable TTA or use the Vulkan backend.\n");
        return -1;
    }

    const unsigned char* pixels = static_cast<const unsigned char*>(inimage.data);
    const int width = inimage.w;
    const int height = inimage.h;
    const int channels = inimage.elempack;
    const int tile = std::max(32, tilesize);
    const int x_tiles = (width + tile - 1) / tile;
    const int y_tiles = (height + tile - 1) / tile;

    for (int tile_y = 0; tile_y < y_tiles; tile_y++)
    {
        const int core_h = std::min((tile_y + 1) * tile, height) - tile_y * tile;
        const int source_y0 = std::max(tile_y * tile - prepadding, 0);
        const int source_y1 = std::min((tile_y + 1) * tile + prepadding, height);

        for (int tile_x = 0; tile_x < x_tiles; tile_x++)
        {
            const int core_w = std::min((tile_x + 1) * tile, width) - tile_x * tile;
            const int source_x0 = std::max(tile_x * tile - prepadding, 0);
            const int source_x1 = std::min((tile_x + 1) * tile + prepadding, width);

            ncnn::Mat source;
            if (channels == 3)
            {
#if _WIN32
                source = ncnn::Mat::from_pixels_roi(pixels, ncnn::Mat::PIXEL_BGR2RGB, width, height, source_x0, source_y0, source_x1 - source_x0, source_y1 - source_y0);
#else
                source = ncnn::Mat::from_pixels_roi(pixels, ncnn::Mat::PIXEL_RGB, width, height, source_x0, source_y0, source_x1 - source_x0, source_y1 - source_y0);
#endif
            }
            else if (channels == 4)
            {
#if _WIN32
                source = ncnn::Mat::from_pixels_roi(pixels, ncnn::Mat::PIXEL_BGRA2RGBA, width, height, source_x0, source_y0, source_x1 - source_x0, source_y1 - source_y0);
#else
                source = ncnn::Mat::from_pixels_roi(pixels, ncnn::Mat::PIXEL_RGBA, width, height, source_x0, source_y0, source_x1 - source_x0, source_y1 - source_y0);
#endif
            }
            else
            {
                fprintf(stderr, "Error: CPU backend requires RGB or RGBA input.\n");
                return -1;
            }

            ncnn::Mat rgb(source.w, source.h, 3);
            for (int channel = 0; channel < 3; channel++)
            {
                const float* input = source.channel(channel);
                float* output = rgb.channel(channel);
                for (int i = 0; i < source.w * source.h; i++) *output++ = *input++ * (1.f / 255.f);
            }
            ncnn::Mat alpha;
            if (channels == 4) alpha = source.channel_range(3, 1).clone();

            const int pad_top = std::max(prepadding - tile_y * tile, 0);
            const int pad_bottom = std::max(std::min((tile_y + 1) * tile + prepadding - height, prepadding), 0);
            const int pad_left = std::max(prepadding - tile_x * tile, 0);
            const int pad_right = std::max(std::min((tile_x + 1) * tile + prepadding - width, prepadding), 0);
            ncnn::Mat padded;
            ncnn::copy_make_border(rgb, padded, pad_top, pad_bottom, pad_left, pad_right, 2, 0.f, net.opt);

            ncnn::Extractor extractor = net.create_extractor();
            if (extractor.input("data", padded) != 0)
            {
                fprintf(stderr, "Error: CPU model input tensor 'data' was not accepted.\n");
                return -1;
            }
            ncnn::Mat inference;
            if (extractor.extract("output", inference) != 0 || inference.empty())
            {
                fprintf(stderr, "Error: CPU inference did not produce tensor 'output'.\n");
                return -1;
            }

            ncnn::Mat alpha_scaled;
            if (channels == 4)
            {
                if (scale == 1) alpha_scaled = alpha;
                else
                {
                    ncnn::Layer* layer = scale == 2 ? bicubic_2x : scale == 3 ? bicubic_3x : bicubic_4x;
                    if (!layer || layer->forward(alpha, alpha_scaled, net.opt) != 0)
                    {
                        fprintf(stderr, "Error: CPU alpha scaling failed.\n");
                        return -1;
                    }
                }
            }

            ncnn::Mat result(core_w * scale, core_h * scale, channels);
            for (int channel = 0; channel < 3; channel++)
            {
                float* output = result.channel(channel);
                const ncnn::Mat predicted = inference.channel(channel);
                for (int y = 0; y < result.h; y++)
                {
                    const float* input = predicted.row(y + prepadding * scale) + prepadding * scale;
                    for (int x = 0; x < result.w; x++) *output++ = std::clamp(*input++ * 255.f + 0.5f, 0.f, 255.f);
                }
            }
            if (channels == 4)
            {
                float* output = result.channel(3);
                const int alpha_x = tile_x == 0 ? 0 : prepadding * scale;
                const int alpha_y = tile_y == 0 ? 0 : prepadding * scale;
                for (int y = 0; y < result.h; y++)
                {
                    const float* input = alpha_scaled.row(y + alpha_y) + alpha_x;
                    for (int x = 0; x < result.w; x++) *output++ = *input++;
                }
            }

            unsigned char* destination = static_cast<unsigned char*>(outimage.data)
                + tile_y * scale * tile * width * scale * channels
                + tile_x * scale * tile * channels;
            const int stride = width * scale * channels;
            if (channels == 3)
            {
#if _WIN32
                result.to_pixels(destination, ncnn::Mat::PIXEL_RGB2BGR, stride);
#else
                result.to_pixels(destination, ncnn::Mat::PIXEL_RGB, stride);
#endif
            }
            else
            {
#if _WIN32
                result.to_pixels(destination, ncnn::Mat::PIXEL_RGBA2BGRA, stride);
#else
                result.to_pixels(destination, ncnn::Mat::PIXEL_RGBA, stride);
#endif
            }

            const float progress = static_cast<float>(tile_y * x_tiles + tile_x + 1) / static_cast<float>(x_tiles * y_tiles) * 100.f;
            fprintf(stderr, "%.2f%%\n", progress);
        }
    }
    return 0;
}
