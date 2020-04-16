declare type RGBColorType = {
    r: number;
    g: number;
    b: number;
};
declare type RGBAColorType = RGBColorType & {
    a: number;
};
export default function clip(source: CanvasImageSource, width: number, height: number, targetPixiColor: RGBAColorType, colorDistance: number, backgroundColor?: RGBColorType): HTMLCanvasElement;
export {};
