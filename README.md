# Anti Scam Bot

Discord Bot that detects scam links and automatically mutes people that send them.
This project uses an [external scam list API](https://phish.sinking.yachts/docs) and also has a ?scamlist command to add additional domains locally.

Example command: ``?scamlist scamwebsite.com`` adds this site to the list (or removes it, if it's already in the list).
This command is for moderators only. You can specify the moderator role in the ``.env`` file.
Using the command without arguments shows the list.

Requires a ``.env`` file in the project root directory.

```
TOKEN=token
LOG_CHANNEL=log_channel_id
MODERATOR_ROLES=moderator_role_id_1,moderator_role_id_2,...
MUTED_ROLE=muted_role_id
IDENTITY=name_or_something_to_identify_by
```
