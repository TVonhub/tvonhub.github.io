import tkinter as tk
from tkinter import filedialog, messagebox

DEFAULT_USER_AGENT = "Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36"

def process_m3u(input_path, output_path):
    try:
        with open(input_path, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f.readlines()]

        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            if line.startswith("#EXTINF"):
                new_lines.append(line)
                # ตรวจสอบว่าบรรทัดถัดไปเป็น EXTVLCOPT หรือไม่
                next_line = lines[i+1] if i+1 < len(lines) else ""
                if next_line.startswith("#EXTVLCOPT:http-user-agent="):
                    new_lines.append(next_line)  # ใช้อันเดิม
                    i += 1
                else:
                    new_lines.append(f"#EXTVLCOPT:http-user-agent={DEFAULT_USER_AGENT}")
                # เพิ่ม URL stream
                if i+1 < len(lines):
                    new_lines.append(lines[i+1])
                    i += 1
            else:
                new_lines.append(line)
            i += 1

        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(new_lines))

        messagebox.showinfo("สำเร็จ", "✅ ไฟล์ถูกสร้างเรียบร้อยแล้ว!")
    except Exception as e:
        messagebox.showerror("เกิดข้อผิดพลาด", str(e))

def select_input_file():
    path = filedialog.askopenfilename(filetypes=[("M3U files", "*.m3u")])
    if path:
        input_entry.delete(0, tk.END)
        input_entry.insert(0, path)

def select_output_file():
    path = filedialog.asksaveasfilename(defaultextension=".m3u", filetypes=[("M3U files", "*.m3u")])
    if path:
        output_entry.delete(0, tk.END)
        output_entry.insert(0, path)

def run_process():
    input_path = input_entry.get()
    output_path = output_entry.get()
    if not input_path or not output_path:
        messagebox.showwarning("กรุณาเลือกไฟล์", "โปรดเลือกไฟล์ต้นฉบับและตำแหน่งบันทึก")
        return
    process_m3u(input_path, output_path)

# GUI setup
root = tk.Tk()
root.title("เพิ่ม EXTVLCOPT ให้ไฟล์ M3U")
root.geometry("500x200")

tk.Label(root, text="เลือกไฟล์ M3U ต้นฉบับ:").pack(pady=5)
input_entry = tk.Entry(root, width=60)
input_entry.pack()
tk.Button(root, text="เลือกไฟล์...", command=select_input_file).pack(pady=5)

tk.Label(root, text="เลือกตำแหน่งบันทึกไฟล์ใหม่:").pack(pady=5)
output_entry = tk.Entry(root, width=60)
output_entry.pack()
tk.Button(root, text="เลือกที่บันทึก...", command=select_output_file).pack(pady=5)

tk.Button(root, text="ดำเนินการ", command=run_process, bg="#4CAF50", fg="white").pack(pady=10)

root.mainloop()
