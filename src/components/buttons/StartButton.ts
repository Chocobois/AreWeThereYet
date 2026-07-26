import Phaser from 'phaser';
import { Button } from '../Button';
import { BaseScene } from '@/scenes/BaseScene';
import { OutlineFilter } from '@/filters/Outline';

export default class PlayerButton extends Button {
  private sprite: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.Text;
  private spriteOutline: OutlineFilter;

  constructor(scene: BaseScene, x: number, y: number, text: string, scaleX: number = 1.4) {
    super(scene, x, y);

    this.sprite = this.scene.add.sprite(x, y, 'pill');
    this.sprite.enableFilters();
    this.sprite.setOrigin(0.5, 1);

    this.text = scene.addText({ x, y: y-90, size: 64, text, color: "black" })
        .setOrigin(0.5,1);

    this.spriteOutline = new OutlineFilter(this.sprite.filterCamera, 8, 0x000000);
    this.sprite.filters!.internal.add(this.spriteOutline);
    this.sprite.scaleX = scaleX

    this.bindInteractive(this.sprite);

  }

  setVisible(value: boolean): this {
      this.sprite.setVisible(value);
      this.text.setVisible(value);
      return this;
  }
}
