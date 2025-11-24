import * as Phaser from 'phaser';
import PlayScene from './PlayScene.js';

const config = {
    type: Phaser.AUTO,
    width: 700,
    height: 700,
    backgroundColor: '#ac7630',
    parent: 'game-container',
    scene: [ PlayScene ]
};

const game = new Phaser.Game(config);