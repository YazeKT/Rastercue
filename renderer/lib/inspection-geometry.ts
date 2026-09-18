/** View-only geometry. Never reads or alters exported image pixels. */
export function fitZoom(viewport:{width:number;height:number},pixels:{width:number;height:number}) {
  return Math.min(viewport.width/Math.max(1,pixels.width),viewport.height/Math.max(1,pixels.height))*100;
}
export function zoomAtPointer(oldZoom:number,nextZoom:number,x:number,y:number,pointerX:number,pointerY:number) {
  const zoom=Math.max(5,Math.min(1600,nextZoom));
  const ratio=zoom/Math.max(.001,oldZoom);
  return {zoom,x:pointerX-(pointerX-x)*ratio,y:pointerY-(pointerY-y)*ratio};
}
