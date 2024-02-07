module.exports = async (client, member) => {
    const memberData = await client.Database.boost(member.id);
    if (memberData.boost == 0) {
        memberData.boost = 1;
        memberData.save();
        client.channels.cache.get(client.log).send(`${member.user.tag} has gained 15$ for boost`);
        console.log(memberData)
    }
    console.log(memberData)

}
