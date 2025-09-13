# Discord

```
Admin
  |
  | /set-birthday @User YYYY-MM-DD
  v
Bot
  |
  | Creates temporary channel #username-birthday-card
  | Schedules template poll 2 weeks before birthday
  v
Private Coordination Channel
  |
  | Bot posts 3–5 random templates
  v
Contributors
  |-- React to vote emojis --> Bot counts votes
  |-- /more-templates --> Bot rerolls new set
  v
Bot
  | Locks in winning template (24h or majority vote)
  | Posts signing link (with cardId)
  v
Contributors
  |-- Click link --> Sign on e-card site
  |-- /who-signed --> Bot polls API for signature count
  v
Bot
  | Posts signature progress updates
  | Sends reminders 3 days & 1 day before deadline
  v
Bot (Birthday)
  | Reveals final card in public channel
  | Assigns Birthday Star role
  | Deletes private coordination channel
```
