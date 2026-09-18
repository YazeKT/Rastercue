import InspectionView from "./inspection-view";
export default function SliderView({ sanitizedImagePath, sanitizedUpscaledImagePath }: {
  sanitizedImagePath: string; sanitizedUpscaledImagePath: string; zoomAmount?: string;
}) { return <InspectionView source={sanitizedImagePath} output={sanitizedUpscaledImagePath}/>; }
