module.exports = async(client, oldMember, newMember) => {

    const oldstatus = oldMember.premiumSince;
    const newstatus = newMember.premiumSince;

    if(!oldstatus && newstatus){
        console.log(`${newMember.user.tag} has boosted the server`);
        
        
    }
    if(oldstatus && !newstatus){
        console.log(`${newMember.user.tag} has unboosted the server`);
    }

}