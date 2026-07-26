import Phaser from 'phaser';
import { OutlineFilterRenderNode } from './OutlineFilterRenderNode';

export class OutlineFilter extends Phaser.Filters.Controller {
  thickness: number;
  glcolor: number[];

  constructor(
    camera: Phaser.Cameras.Scene2D.Camera,
    thickness = 4,
    color = 0xff0000,
  ) {
    super(camera, 'FilterOutline');

    this.thickness = thickness;
    this.glcolor = [
      ((color >> 16) & 0xff) / 255,
      ((color >> 8) & 0xff) / 255,
      (color & 0xff) / 255,
    ];

    const renderer = camera.scene.sys
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    const renderNodes = renderer.renderNodes as any;

    if (!renderNodes.hasNode('FilterOutline')) {
      renderNodes.addNode(
        'FilterOutline',
        new OutlineFilterRenderNode(renderNodes),
      );
    }
  }

  getPadding(): Phaser.Geom.Rectangle {
    const override = this.paddingOverride;
    if (override) {
      this.currentPadding.setTo(
        override.x,
        override.y,
        override.width,
        override.height,
      );
      return override;
    }

    const t = Math.ceil(this.thickness);
    const padding = this.currentPadding;
    padding.left = -t;
    padding.top = -t;
    padding.right = t;
    padding.bottom = t;

    return padding;
  }

  get color(): number {
    const c = this.glcolor;
    return ((c[0] * 255) << 16) | ((c[1] * 255) << 8) | (c[2] * 255);
  }

  set color(value: number) {
    this.glcolor[0] = ((value >> 16) & 0xff) / 255;
    this.glcolor[1] = ((value >> 8) & 0xff) / 255;
    this.glcolor[2] = (value & 0xff) / 255;
  }
}
