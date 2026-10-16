# Keyboard navigation

The section selector keeps five unique destinations in a fixed logical order
around an endless arc. Only the current destination is in the Tab order; Left
and Right loop from it, while Home and End choose the first and last
destinations. Selecting a destination keeps focus on its native button. Enter
or Space on the current destination opens its inventory and focuses its current
item; Down is a shortcut to the same handoff. Tab and Shift+Tab remain native.
Wheel input settles after a short pause, and a continuous drag commits its final
destination when released, so one gesture creates one browser-history step.
When wheel movement reaches a section step, the selector takes focus; Tab,
another key, or pointer/focus movement outside it cancels a pending preview.

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
lightbox and restores the photo. From an album with multiple albums it returns
to the album list; from a single-album view, including its deep route, it
returns directly to the selector. Escape from a multi-album list returns to the
selector. Tab and Shift+Tab remain native outside modal lightbox behavior.
