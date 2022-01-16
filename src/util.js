// checks if user has moderator role, uses msg to get the guild member of the user
async function isModerator(userid, msg) {
    const moderatorRoles = process.env.MODERATOR_ROLES.split(',');
    const member = await msg.guild.members.fetch(userid);
    const userIsModerator = await member.roles.cache.some(r => moderatorRoles.includes(r.id));
    return userIsModerator;
}

module.exports = {isModerator}
