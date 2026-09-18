import { sanitizePath } from "@common/sanitize-path";
import InspectionView from "./inspection-view";
export default function ImageViewer({ imagePath, setDimensions }: {
  imagePath:string;setDimensions:(dimensions:{width:number;height:number})=>void;
}) { return <InspectionView source={sanitizePath(imagePath)} setDimensions={setDimensions}/>; }
