// Ambient declaration for react-photo-album (useful, not minimal)
declare module "react-photo-album" {
  import * as React from "react";

  export type LayoutType = "rows" | "columns" | "masonry";

  export interface Photo {
    src: string;
    width?: number;
    height?: number;
    alt?: string;
    srcSet?: Array<{ src: string; width: number; height?: number }>;
    key?: React.Key;
    [key: string]: any;
  }

  export interface RenderPhotoLayout {
    index: number;
    width: number;
    height: number;
    top: number;
    left: number;
    containerWidth: number;
    containerHeight?: number;
    columns?: number;
    rowHeight?: number;
  }

  export interface RenderPhotoProps {
    photo: Photo;
    layout: RenderPhotoLayout;
    imageProps: React.ImgHTMLAttributes<HTMLImageElement>;
  }

  export type RenderPhoto = (props: RenderPhotoProps) => React.ReactNode;

  export type PhotoClickHandler = (
    event: React.MouseEvent,
    photo: Photo,
    index: number
  ) => void;

  export interface RowConstraints {
    maxPhotos?: number;
    minPhotos?: number;
    singleRowMaxHeight?: number;
  }

  export interface ComponentsOverride {
    Image?: React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>;
    Container?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
  }

  export interface PhotoAlbumProps {
    photos: Photo[];
    layout?: LayoutType;
    // layout sizing
    targetRowHeight?: number | ((containerWidth: number) => number);
    columns?: number | ((containerWidth: number) => number);
    spacing?: number;
    padding?: number;
    rowConstraints?: RowConstraints;
    // rendering
    renderPhoto?: RenderPhoto;
    components?: ComponentsOverride;
    sizes?: string;
    defaultContainerWidth?: number;
    // behavior
    onClick?: PhotoClickHandler;
    breakpoints?: number[];
    // allow extra vendor-specific props without type errors
    [key: string]: any;
  }

  const PhotoAlbum: React.FC<PhotoAlbumProps>;
  export default PhotoAlbum;
}
