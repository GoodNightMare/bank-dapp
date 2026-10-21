# Assignment 5 — Night Bank

ระบบธนาคาร DApp สำหรับ Sepolia: เชื่อม MetaMask, ฝาก, ถอน และตรวจสอบยอดฝากของบัญชีปัจจุบัน
เป็น Contract ที่สร้างขึ้นใหม่ ไม่ใช่โค้ดต้นฉบับจากอาจารย์

## 1. Deploy Contract
1. เปิด Remix แล้วสร้างไฟล์ Bank.sol จากไฟล์ในชุดนี้
2. Compile ด้วย Solidity 0.8.20 หรือ 0.8.x ที่ใหม่กว่า
3. ทดลองใน Remix VM ก่อนได้ แต่เว็บนี้เชื่อม Sepolia เท่านั้น
4. ใน MetaMask เลือก Sepolia และเตรียม SepoliaETH ทดสอบให้พอค่า gas
5. ใน Remix เลือก Browser Extension, Contract = Bank, Value = 0 แล้ว Deploy
6. ยืนยันใน MetaMask รอสำเร็จ แล้วคัดลอก Contract Address จาก Deployed Contracts

## 2. ตั้งค่าเว็บ
แก้ config.js:
- contractAddress: ใส่ Bank Contract Address ที่ Deploy บน Sepolia
- studentId: ใส่รหัสนักศึกษาจริง
ชื่อผู้จัดทำอยู่ใน index.html สามารถแก้ได้
เว็บใช้ ethers.js 6.13.5 ผ่าน jsDelivr จึงต้องมีอินเทอร์เน็ต
ไม่ต้องใส่ private key หรือ seed phrase ในโค้ด

## 3. ทดลอง
เปิดเว็บผ่าน local web server เช่น VS Code Live Server หรือ python3 -m http.server 8000
เชื่อม MetaMask แล้วฝาก 0.001 ETH จากนั้นถอน 0.0004 ETH
ยอดฝากที่เหลือควรเท่ากับ 0.0006 ETH ส่วนยอดกระเป๋าจะหักค่า gas เพิ่มด้วย
บัญชีอื่นต้องเห็นยอดฝากของตัวเองเป็น 0 และไม่สามารถถอนเงินของบัญชีแรกได้
ทดลองถอนเกินยอดควรแสดงข้อผิดพลาด และการยกเลิกใน MetaMask ควรกลับมาใช้งานปุ่มได้

## 4. GitHub Pages
1. สร้าง repository เช่น bank-dapp บน GitHub
2. อัปโหลดไฟล์ index.html, app.js, config.js และ .nojekyll ไว้ที่ root ของ repository
   อัปโหลด Bank.sol และ README.md เพิ่มด้วยได้
3. เปิด Settings > Pages > Build and deployment
4. เลือก Deploy from a branch, branch main, folder /(root) แล้ว Save
5. รอ GitHub แจ้ง URL ที่เผยแพร่สำเร็จ แล้วเปิดทดสอบผ่าน MetaMask
6. ส่ง URL ที่ GitHub แสดงใน dlearning

## Contract API
- deposit() payable: ฝาก ETH โดย msg.value ต้องมากกว่า 0
- withdraw(uint256 amount): ถอนจำนวนหน่วย wei จากยอดของผู้เรียก
- checkBalance() view returns (uint256): ยอดฝากของผู้เรียก หน่วย wei
ไม่มีสิทธิ์เจ้าของสำหรับถอนเงินของผู้อื่น

## ขอบเขตการตรวจสอบ
ตรวจ syntax JavaScript ในสภาพแวดล้อมสร้างไฟล์แล้ว
ยังไม่ได้ Deploy Contract จริงหรือทดสอบธุรกรรม MetaMask แบบ end-to-end
ก่อนส่งงานต้องเติมรหัสนักศึกษา Deploy Bank.sol และใส่ Address จริงใน config.js
