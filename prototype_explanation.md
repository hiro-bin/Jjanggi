### CSS Styling Changes for UI Elements

The following changes have been applied to `frontend/public/App.css` to unify the design of `score-board`, `howToPlay`, and modal elements (`nickname-modal`, `delete-room-modal`) in line with the project's traditional Janggi theme:

#### `score-board` and `howToPlay`

*   **Background Color:** The original `background-color: #f5f5ef;` has been commented out and replaced with a semi-transparent creamy beige: `background-color: rgba(245, 245, 220, 0.8);`. This allows the underlying wood background texture to show through, adding depth and coherence to the theme.
*   **Border:** The original `border: 1px solid black;` has been commented out and replaced with a 2px `outset` border in `SaddleBrown` (`#8B4513`): `border: 2px outset #8B4513;`. This creates a tactile, 3D, carved-wood effect, enhancing the classic game board aesthetic.

#### Modals (`nickname-modal`, `delete-room-modal` - styled via `.modal-content`)

*   **Background Color:** The original `background-color: #fff;` has been commented out and replaced with a slightly more opaque, warm off-white (rice paper-like) color: `background-color: rgba(255, 253, 248, 0.95);`. This ensures modals stand out clearly while still blending with the overall warm palette.
*   **Border:** A new 2px `outset` border in `Peru` (`#CD853F`) has been added: `border: 2px outset #CD853F;`. This provides a consistent, elevated border style similar to the other main UI elements, maintaining the classic feel for interactive modal components.