# Keyboard navigation

The section selector keeps its five destinations in a fixed order. Tab moves
through its native buttons; Left/Right moves from the focused destination, and
Home/End moves to the first/last destination. Selecting a destination keeps
focus on its selector button.

Each inventory has one roving slot tab stop. While a slot is focused, arrows
move among slots and Home/End move to the first/last slot. Enter opens the
focused item. Tab and Shift+Tab leave the inventory natively; the visible
“← characters” control also returns focus to the current selector choice.
Escape returns to that selector without changing the current section. Focus
movement follows the focused slot, so leaving with Tab during a pending arrow
move does not pull focus back into the inventory.

Escape closes one nested view at a time. In a text reader or contact letter it
closes the reader and returns focus to its inventory item; another Escape from
the inventory returns to the selector. In a photo lightbox it closes the
lightbox and restores the photo. From an album it returns to the album list;
Escape there returns to the selector. Tab and Shift+Tab remain native outside
modal lightbox behavior.
