// Rastercue CPU inference sidecar, derived from Upscayl-NCNN and the
// MIT-licensed NCNN CPU tiling path by nihui. See README.md and notices.
#ifndef RASTERCUE_CPU_REALESRGAN_H
#define RASTERCUE_CPU_REALESRGAN_H

#include <string>
#include "net.h"
#include "layer.h"

class RealESRGAN
{
public:
    RealESRGAN(int device_id, bool tta_mode = false, int num_threads = 1);
    ~RealESRGAN();

#if _WIN32
    int load(const std::wstring& parampath, const std::wstring& modelpath);
#else
    int load(const std::string& parampath, const std::string& modelpath);
#endif

    int process(const ncnn::Mat& inimage, ncnn::Mat& outimage) const;

    int scale = 4;
    int tilesize = 200;
    int prepadding = 10;

private:
    ncnn::Net net;
    ncnn::Layer* bicubic_2x = nullptr;
    ncnn::Layer* bicubic_3x = nullptr;
    ncnn::Layer* bicubic_4x = nullptr;
    bool tta_mode = false;
};

#endif
