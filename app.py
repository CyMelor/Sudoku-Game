from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import json
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)

# 配置模板目录
app.template_folder = 'html'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

def save_sudoku_image(board, difficulty, timestamp):
    # 创建500x500的白色正方形图片
    size = 500
    cell_size = size // 9
    image = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(image)
    
    # 常见字体文件列表，用于在一张图片中使用多种字体
    font_files = [
        'arial.ttf', 'times.ttf', 'courier.ttf', 'verdana.ttf', 'georgia.ttf',
        'impact.ttf', 'comic.ttf', 'arialbd.ttf', 'ariali.ttf', 'tahoma.ttf',
        'calibri.ttf', 'century.ttf', 'arialbi.ttf', 'timesbd.ttf', 'courbd.ttf',
        'verdanab.ttf', 'georgiab.ttf', 'arialn.ttf', 'timesi.ttf', 'courbi.ttf'
    ]
    
    # 绘制数独网格
    for i in range(10):
        # 粗线用于3x3宫格分隔
        line_width = 3 if i % 3 == 0 else 1
        
        # 绘制横线
        y = i * cell_size
        draw.line([(0, y), (size, y)], fill='black', width=line_width)
        
        # 绘制竖线
        x = i * cell_size
        draw.line([(x, 0), (x, size)], fill='black', width=line_width)
    
    # 填充数字，为每个数字使用不同的字体
    for i in range(81):
        row = i // 9
        col = i % 9
        number = board[i]
        
        if number != 0:
            # 计算数字在单元格中的位置，使其居中
            x = col * cell_size + cell_size // 2
            y = row * cell_size + cell_size // 2
            
            # 为当前单元格选择字体，循环使用字体列表
            font_size = cell_size // 2
            base_font_index = i % len(font_files)
            current_font = None
            
            # 尝试加载字体，如果当前字体不可用则尝试下一个
            for offset in range(len(font_files)):
                font_index = (base_font_index + offset) % len(font_files)
                font_file = font_files[font_index]
                try:
                    current_font = ImageFont.truetype(font_file, font_size)
                    break
                except Exception:
                    continue
            
            # 如果所有字体都不可用，则使用默认字体
            if current_font is None:
                current_font = ImageFont.load_default()
            
            # 获取文本大小并居中
            bbox = draw.textbbox((0, 0), str(number), font=current_font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            draw.text(
                (x - text_width // 2, y - text_height // 2),
                str(number),
                fill='black',
                font=current_font
            )
    
    # 确保图片目录存在
    img_dir = os.path.join('data', 'val-test', 'img', difficulty)
    os.makedirs(img_dir, exist_ok=True)
    
    # 保存图片
    filename = f'{timestamp}.png'
    file_path = os.path.join(img_dir, filename)
    image.save(file_path)

@app.route('/api/save_sudoku', methods=['POST'])
def save_sudoku():
    try:
        data = request.get_json()
        board = data['board']
        difficulty = data['difficulty']
        
        # 确保难度目录存在
        label_dir = os.path.join('data', 'val-test', 'label', difficulty)
        os.makedirs(label_dir, exist_ok=True)
        
        # 生成唯一文件名（使用时间戳）
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]
        filename = f'{timestamp}.json'
        file_path = os.path.join(label_dir, filename)
        
        # 保存数独的一维数组
        with open(file_path, 'w') as f:
            json.dump(board, f)
        
        # 生成并保存数独图片
        save_sudoku_image(board, difficulty, timestamp)
        
        return jsonify({'success': True, 'message': '数独已成功保存'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=15000)
