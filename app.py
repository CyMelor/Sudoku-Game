from flask import Flask, render_template, send_from_directory
import os

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=15000)
