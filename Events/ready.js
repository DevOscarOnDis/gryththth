const userscema = require("../Database/Schema/User");
const json = require("jsonbyte")
const db = new json("./database.json")
/*
*@ params {}
*/
module.exports = async (client) => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`rova On Top`, { type: 'PLAYING' });
  client.Database.fixall()

  // here man
  const all_data = await userscema.find({});
  let member = [];

  for (const obj of all_data) {
    if (
      client.users.cache
        .map((member) => member.id)
        .includes(obj.id)
    ) member.push(obj);
  }
  member = member.sort(function(b, a) {
    return a.money - b.money;
  });
  member = member.filter(function BigEnough(value) {
    return value.money > 0;
  });
  member = member.slice(0, 100);
  let desc = "";
  let pos = 0;
  member.forEach(user => {
    const usesr = client.users.cache.get(user.id);
    if (!usesr) return;
    let m = user.money;
    let bal = abbrNum(m, 2)
    if (pos === 0) {
      desc += `
        <div class="contentf first">
                    <div class="user-avatar">
                        <img src="images/crowns.svg" alt="" class="top-one-crown">
                        <img src="https://cdn.discordapp.com/avatars/${usesr.id}/${usesr.avatar}.png">
                    </div>
                    <div class="user-name">${usesr.username}</div>
                    <div class="user-money">${bal}<img src="images/topStar.svg"></div>
                </div>
                
                `;
      pos += 1;
    } else {

      desc += `
        <div style="
    display: flex;
    margin: auto;
    align-items: center;
    text-align: center;
">
        <div class="pos">${pos}</div>
        <div class="contentf">
      <div class="user-avatar">
          <img src="https://cdn.discordapp.com/avatars/${usesr.id}/${usesr.avatar}.png">
      </div>
      <div class="user-name">${usesr.username}</div>
      <div class="user-money">${bal}<img src="images/topStar.svg"></div>
  </div>
  </div>`;
    }
    pos++;
  });
  if (db.exists("top")) {
    db.change("top", desc).leave().save()
  } else {
    db.create("top", desc).leave().save()
  }

}
// طبعا مش انا الي عامل الكود ده
function abbrNum(number, decPlaces) {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);

  // Enumerate number abbreviations
  var abbrev = ["k", "m", "b", "t"];

  // Go through the array backwards, so we do the largest first
  for (var i = abbrev.length - 1; i >= 0; i--) {

    // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10, (i + 1) * 3);

    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      number = Math.round(number * decPlaces / size) / decPlaces;

      // Handle special case where we round up to the next abbreviation
      if ((number == 1000) && (i < abbrev.length - 1)) {
        number = 1;
        i++;
      }

      // Add the letter for the abbreviation
      number += abbrev[i];

      // We are done... stop
      break;
    }
  }

  return number;
}