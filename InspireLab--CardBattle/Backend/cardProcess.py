import sys
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont
import json

CARD_DISCRUBTION = sys.argv[1]
print(CARD_DISCRUBTION)
print(type(CARD_DISCRUBTION))
#  card = { // in Json
#       cid,
#       studentId,
#       createdAt: new Date(),
#       monsterName,
#       monsterImage: monsterImagePath,
#       cardFrontImage: cardFrontImagePath,
#       cardBackImage: cardBackImagePath,
#       monsterAttribute,
#       skill1Attribute: skill1Attribute || "",
#       skill2Attribute: skill2Attribute || "",
#       skill1Attack: skill1Attack || 0,
#       skill2Attack: skill2Attack || 0,

CardInfo = json.loads(CARD_DISCRUBTION)
MONSTERNAME = CardInfo["monsterName"]
base_path = "C:/Users/tony1/OneDrive/桌面/InspireLab--CardBattle/Backend"
def get_wuxing_path(attribute_chinese):
    # 五行屬性中英對照
    wuxing_translation = {
        "金": "metal",
        "木": "wood",
        "水": "water",
        "火": "fire",
        "土": "earth"
    }
    
    
    english_attr = wuxing_translation.get(attribute_chinese)
    
    if english_attr:
        return f"{base_path}/card_frames/card_frame_{english_attr}.png"
    else:
        raise ValueError(f"無效的五行屬性: {attribute_chinese}（只接受：金、木、水、火、土）")
wuxing_colors_rgb = {
    "金": (218, 165, 32),    # 黄金色 (暗调)
    "木": (5, 140, 90),     # 森林绿 
    "水": (0, 105, 148),     # 深水蓝
    "火": (178, 34, 34),     # 火红色 (暗调)
    "土": (139, 69, 19)      # 土棕色
}







#######

# 打开背景图像和前景图像
try:
    MonsterImg = Image.open(f"{base_path}/uploads/monsterImages/{CardInfo['cid']}.png")
    CardFrame = Image.open(get_wuxing_path(CardInfo["monsterAttribute"]))
except IOError:
    # 如果没有图像文件，创建示例图像
    # background = Image.new("RGB", (800, 600), color="lightblue")
    # foreground = Image.new("RGBA", (200, 200), color=(255, 0, 0, 128))  # 半透明红色方块
    print("error")

# 调整前景图像大小(可选)
MonsterImgRe = MonsterImg.resize((1100, 600))

# 计算粘贴位置（居中）
paste_position = (
    -200,
    0
)

def uploadimage(MonsterImg, CardFrame):
  alpha_paste = CardFrame.copy()
  alpha_paste.paste(MonsterImg, paste_position)
  alpha_paste.paste(CardFrame, (0,0), CardFrame)

  return alpha_paste

def uploadtext(img):
    # 创建一个副本用于绘制
    text_img = img.copy()
    draw = ImageDraw.Draw(text_img)
    # 尝试使用系统字体，如果失败则使用默认
    try:
      # 对于不同操作系统，可能需要不同的字体路径
      # Windows字体路径示例
      font = ImageFont.truetype(font = f"{base_path}/SmileySans-Oblique.ttf", size = 40)
    except IOError:
      print("fail font")
      font = ImageFont.load_default()
    draw.text((90, 600), f"技能1：造成{CardInfo['skill1Attack']}點傷害 \n技能2：造成{CardInfo['skill2Attack']}點傷害", fill = wuxing_colors_rgb[CardInfo['monsterAttribute']], font=font)
    return text_img

# if CardFrame.mode == 'RGBA':
CardWithIm = uploadimage(MonsterImg, CardFrame)
CardWithImTx = uploadtext(img = CardWithIm)
CardWithImTx.save(f'{base_path}/{CardInfo["cardFrontImage"]}', "PNG")
print(CardInfo["cardFrontImage"])
# else:
#   print('error')
CardWithImTx
