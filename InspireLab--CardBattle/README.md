# InspireLab--CardBattle

Card game Aims to let student have a taste with AI drawing.

## Gameplay

1. Set up stage:

   - Each player choose their element (Matel, Wood, Fire, Water, Earth)
   - Each player Generate their disired 3 monsters
   - Each player disign their 2 attact skills, with damge sum < 100, and element of the skills
   - Each monster will have hp = 500

2. Prepare the game:

   - Each player will have their card printed on the table
   - Each player will have their deck of cards
   - Each card will have a QR code on it, use a terminal to scan the QR code to join the game

3. Start the game: #USMCU(unless some magic card is used)

   - Each player will have 10 seconds to join the game
   - The game will start when all players have joined

     - Game: in each game, player will have 3 magic cards and 3 monster cards, winner will be the one who wins the most rounds.
     - Round: in each round, each player will place one monster card on table until one of them is defeated.

     - Turn: each turn monster will attact each other once, player can take turn use magic card at the beginning of the turn, one with. Monster will attact togethter or take turn to attack in the first turn of each round, depending on the last game result.
       | last game result | monster take turn |
       | ----------------- | ----------------- |
       | player 1 win | player 1 |  
       | player 2 win | player 2 |
       | tie | attact together |
       | first game | attact together |
       following turn will keep using the same attack pattern.
       In turn, card will randomly choose a skill to use.
       final Damage will be _ 1.5 if the element of the monster is counter by elment of skill.
       final Damage will be _ 0.66 if the element of the skill is counter by elment of monster.

4. Magic Card:

   - 《逆天改命》：場上我方怪物 hp - 70，本回合（Round）場上所有剋制關係逆轉，剋制增傷改爲*2.5，剋制減傷改爲*0.2 本回合（Round）對手無法再使用《逆天改命》
   - 《兵貴神速》：本輪（turn）由我方怪物（Monster）先手，且本輪（turn）對手無法再使用《兵貴神速》。
   - 《背水一戰》：你可以決定本輪（turn）敵方怪物使用的技能，若我方上回合（Round）游戲沒有獲勝，即落敗或平局，則追加決定我方本輪（turn）使用的技能。本回合（Round）對手無法再使用《背水一戰》。
