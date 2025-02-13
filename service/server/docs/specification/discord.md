# Discord Bot Overall Specification

## Interaction System
- Configurable per channel
  - Channel for broadcasting information / Language settings
- Upon completion of settings, delete all previously sent messages and broadcast the updated information

## Job System
- Live Videos are sent as 1 Message (1 Embed) each (to notify users)
- Upcoming Videos are managed in 1 Message (multiple embeds)
  - Update 1 Message if there are differences in the content of the Video included in the embed compared to the last sent time (e.g., if the status changes from upcoming, title changes, or start time changes)
  - Embeds are sorted in ascending order by broadcast start time
- Ended Videos are not sent
- Cannot update or delete the content of messages sent by the Bot

### Send Related Specifications
- Status of the Embed (Video) included in the posted message: `live`
  - Current Video Status: `live`
  - Expected Action: Do nothing

- Status of the Embed (Video) included in the posted message: `live`
  - Current Video Status: `upcoming`
  - Expected Action: Delete the currently posted Message as `live` + Post a new `upcoming` message (if there is already an `Upcoming` message, update it)

- Status of the Embed (Video) included in the posted message: `live`
  - Current Video Status: `ended`
  - Expected Action: Delete the currently posted Message as `live`

- Status of the Embed (Video) included in the posted message: `upcoming`
  - Current Video Status: `live`
  - Expected Action: Delete the video in the embed included in the `upcoming` message (delete the message if there is only one) + Post a new `live` message

- Status of the Embed (Video) included in the posted message: `upcoming`
  - Current Video Status: `upcoming`
  - Expected Action: Do nothing

- Status of the Embed (Video) included in the posted message: `upcoming`
  - Current Video Status: `ended`
  - Expected Action: Delete the video in the embed included in the `upcoming` message (delete the message if there is only one)

- If there is no change in status
  - Expected Action: If there are differences between the Embed (Video) included in the posted message and the current Video fields, update that embed (isUpdateRequired)