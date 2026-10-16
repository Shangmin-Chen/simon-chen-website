# Game-menu interaction and responsive contract

This portfolio borrows the rhythm and clear hierarchy of an ASCII game menu while remaining a semantic React and browser-DOM application. Preserve the existing SC intro, horizontal-eye portrait, shallow endless character semicircle, dark HSL token palette, and typographic inventory. Do not introduce image or 3D decoration for this interface.

## Interaction contract

- The character menu is a five-destination endless selector. Its visible heading is **Pick your character**, and its selector hint remains exactly **scroll / drag**. Left/Right loop through destinations; Home/End choose endpoints. Pointer activation, drag, and accumulated wheel input remain supported.
- Each inventory is one predictable grid. Arrow keys move by visible grid position; Home/End reach the bounds; Enter/Space opens the selected item; Escape follows the contextual Back action. Tab leaves the inventory in normal document order. The interface labels open actions and states next to the relevant controls.
- Photos and contact social profiles are discoverable from their landing scenes. Reader and composer Back labels describe the destination. Previous/Next actions include the adjacent item name for assistive technology.
- Native keyboard focus and browser tab order are distinct from gamepad/spatial navigation. Current DOM buttons, visible focus, explicit keyboard movement, and action cues are sufficient for this site's current input scope.

## Responsive and motion contract

- The document does not scroll. The shell uses the viewport height and inventory racks and reader bodies own independent native scrolling.
- At short landscape sizes such as 568×320 and 625×390, browsing keeps a compact portrait/selector rail beside a useful inventory area. The portrait stays proportionally rendered from its ASCII source. The workspace must retain positive rack height and enough width for labels and actions.
- Extremely short narrow windows below 400px high and 480px wide temporarily use a 96px selector-only band; all five 50px character controls remain intact while only their vertical arc placement is compressed.
- When a reader or the contact letter is open on compact screens, it receives the full workspace. The character rail is hidden only while the open panel is active; Back restores the browsing arrangement automatically. Hidden inactive panels do not control the layout.
- Interactive targets are at least 44px high in normal layouts. The existing 28px terminal-shell controls are retained only in short landscape layouts to preserve usable content height. Compact action text remains at least 10px and body copy at least 16px.
- Focus, selected, and open states use the existing semantic tokens and remain distinguishable without motion. CSS transitions are brief and decorative; input never waits for an animation. Respect `prefers-reduced-motion` and the existing motion toggle.

## Framework evaluation

**Recommendation: keep the current React DOM architecture and add no navigation framework or dependency for this pass.** The domain already owns selector geometry and inventory layout/movement; UI maps those results to semantic buttons. A new library would add a second focus model without solving a current missing capability.

- [Xbox Accessibility Guideline 112](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112) calls for predictable, consistent navigation and complete digital-input interaction. [Guideline 114](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/114) calls for clear hierarchy, actions, and expected outcomes. These support the focus order and explicit action cues here; they do not prescribe a specific framework.
- [W3C CSS Spatial Navigation](https://www.w3.org/TR/css-nav-1/) is a directional-focus model draft for spatial navigation. It is not the same thing as browser-native Tab/Shift+Tab, and the document is not a general gamepad controller API.
- [Norigin Spatial Navigation](https://devportal.noriginmedia.com/docs/Norigin-Spatial-Navigation/guides/concepts/) is a React spatial-focus tree with geometric movement and remembered focus; its [installation guide](https://devportal.noriginmedia.com/docs/Norigin-Spatial-Navigation/guides/installation/) requires core and React packages. It is a credible future option if TV-remotes, directional controllers, or spatial focus across many views become product requirements. Today, auto-geometric movement would conflict with the deliberate circular selector and the rack's domain-defined row/column movement, while requiring a focus-model integration across all interactive components.
- [XState](https://stately.ai/docs/xstate) models state machines and actors. It would be useful if menus acquired substantially more concurrent or interruptible interaction modes, but the current selection/open/close flows are already small and explicit in React and pure domain functions.
- [Phaser](https://docs.phaser.io/) is a browser game framework with a rendering/input engine. Replacing this accessible DOM portfolio with a canvas/game-engine UI would discard semantic content and require rebuilding the existing responsive and assistive-technology behavior.
- If gamepad support becomes a concrete requirement, start with a small adapter over the browser [Gamepad API](https://www.w3.org/TR/gamepad/) that maps controller actions onto the existing move, select, open, and close operations. Keep those operations shared with keyboard input and preserve DOM focus for assistive technology.

## Acceptance checks

Manually check 568×320, 625×390, a standard narrow phone, and a desktop viewport. Browse inventory and album content with pointer/touch and keyboard; verify the rack can scroll independently, focus remains visible, and open actions are apparent. Open a reader and contact letter, verify the panel uses the full compact workspace and its own content scrolls, then Back and confirm the portrait, selector, and previous selection return. Check the gallery and contact landing routes for visible contextual Back and social links. With reduced motion enabled, all focus and open state changes must remain immediate and clear.
