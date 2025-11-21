export const getPixelCoords = (gridX, gridY, gridConfig) => {
    const { gridTopLeftX, gridTopLeftY, tileWidth, tileHeight } = gridConfig;
    return {
        x: gridTopLeftX + gridX * tileWidth,
        y: gridTopLeftY + gridY * tileHeight
    };
};

export const getGridCoordsFromPixels = (pixelX, pixelY, gridConfig) => {
    const { gridTopLeftX, gridTopLeftY, tileWidth, tileHeight } = gridConfig;
    const x = Math.round((pixelX - gridTopLeftX) / tileWidth);
    const y = Math.round((pixelY - gridTopLeftY) / tileHeight);
    return { x, y };
}

export const getPieceAssetKey = (piece) => {
    const type = piece.type;
    const owner = piece.owner;

    if (owner === 'player1') {
        switch (type) {
            case 'cha': return 'chocha';
            case 'ma': return 'choma';
            case 'sang': return 'chosang';
            case 'sa': return 'chosa';
            case 'king': return 'chowang';
            case 'po': return 'chopo';
            case 'byeong': return 'chojol';
            default: return '';
        }
    } else {
        switch (type) {
            case 'cha': return 'hancha';
            case 'ma': return 'hanma';
            case 'sang': return 'hansang';
            case 'sa': return 'hansa';
            case 'king': return 'hanwang';
            case 'po': return 'hanpo';
            case 'jol': return 'hanjol';
            default: return '';
        }
    }
};

export const getPieceOwner = (pieceId) => {
    if(/^p1/.test(pieceId)) return 'player1';
    else if(/^p2/.test(pieceId)) return 'player2';
    else return 'unknown';
};
