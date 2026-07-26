import Phaser from 'phaser';
import shader from './OutlineShader.glsl?raw';

export class OutlineFilterRenderNode
  extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader
{
  constructor(manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
    super('FilterOutline', manager, undefined, shader);
  }

  setupUniforms(
    controller: any,
    drawingContext: Phaser.Renderer.WebGL.DrawingContext,
  ): void {
    this.programManager.setUniform('uThickness', controller.thickness);
    this.programManager.setUniform('uColor', controller.glcolor);
    this.programManager.setUniform('uResolution', [
      drawingContext.width,
      drawingContext.height,
    ]);
  }
}
