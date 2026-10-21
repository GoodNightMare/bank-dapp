'use strict';
const $ = id => document.getElementById(id);
const ABI = ['function deposit() payable', 'function withdraw(uint256 amount)', 'function checkBalance() view returns (uint256)'];
const config = window.BANK_CONFIG || {};
let provider, signer, account, busy = false;
$('studentId').textContent = config.studentId || 'ยังไม่ได้ระบุ';
$('contractAddress').value = config.contractAddress || localStorage.getItem('nightBankAddress') || '';
function status(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}
function wallet() {
  const injected = window.ethereum;
  const result = injected?.providers?.find(p => p.isMetaMask) || injected;
  if (!result) throw new Error('กรุณาติดตั้ง MetaMask และเปิดเว็บด้วยเบราว์เซอร์ที่ติดตั้ง MetaMask');
  return result;
}
async function ready() {
  if (!signer) throw new Error('กรุณาเชื่อมต่อ MetaMask ก่อน');
  if (await wallet().request({method: 'eth_chainId'}) !== '0xaa36a7') throw new Error('กรุณาเปลี่ยนเครือข่ายใน MetaMask เป็น Sepolia แล้วเชื่อมต่อใหม่');
  const address = $('contractAddress').value.trim();
  if (!ethers.isAddress(address)) throw new Error('กรุณาใส่ Contract Address ให้ครบและถูกต้อง');
  if (await provider.getCode(address) === '0x') throw new Error('ไม่พบ Contract ที่ Address นี้บน Sepolia');
  return new ethers.Contract(address, ABI, signer);
}
async function refresh() {
  const bank = await ready();
  const balance = await bank.checkBalance();
  $('balance').textContent = ethers.formatEther(balance);
  return balance;
}
async function run(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(b => b.disabled = true);
  try { await action(); }
  catch (error) {
    const cancelled = error.code === 4001 || error.code === 'ACTION_REJECTED';
    status(cancelled ? 'ยกเลิกรายการใน MetaMask แล้ว' : (error.reason || error.shortMessage || error.message || 'เกิดข้อผิดพลาด'), true);
  } finally {
    busy = false;
    document.querySelectorAll('button').forEach(b => b.disabled = false);
  }
}
$('connect').onclick = () => run(async () => {
  if (!window.ethers) throw new Error('โหลด ethers.js ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรช');
  const injected = wallet();
  await injected.request({method: 'eth_requestAccounts'});
  if (await injected.request({method: 'eth_chainId'}) !== '0xaa36a7') {
    await injected.request({method: 'wallet_switchEthereumChain', params: [{chainId: '0xaa36a7'}]});
  }
  provider = new ethers.BrowserProvider(injected);
  signer = await provider.getSigner();
  account = await signer.getAddress();
  $('account').textContent = account;
  $('connect').textContent = 'เชื่อมต่อแล้ว · Sepolia';
  status('เชื่อมต่อกระเป๋าสำเร็จ');
  if ($('contractAddress').value.trim()) await refresh();
});
$('save').onclick = () => run(async () => {
  const address = $('contractAddress').value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error('Address ต้องขึ้นต้นด้วย 0x ตามด้วยตัวอักษรฐานสิบหก 40 ตัว');
  localStorage.setItem('nightBankAddress', address);
  $('explorer').href = 'https://sepolia.etherscan.io/address/' + address;
  $('explorer').hidden = false;
  $('balance').textContent = '—';
  status('บันทึก Contract Address แล้ว');
  if (signer) await refresh();
});
$('contractAddress').addEventListener('input', () => { $('balance').textContent = '—'; $('explorer').hidden = true; });
$('refresh').onclick = () => run(async () => { await refresh(); status('อัปเดตยอดเงินเรียบร้อย'); });
function amount(id) {
  const raw = $(id).value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(raw)) throw new Error('ใส่จำนวน ETH เป็นตัวเลข ทศนิยมได้ไม่เกิน 18 ตำแหน่ง');
  const value = ethers.parseEther(raw);
  if (value <= 0n) throw new Error('จำนวนเงินต้องมากกว่า 0');
  return value;
}
async function transact(kind) {
  const bank = await ready();
  const id = kind === 'deposit' ? 'depositAmount' : 'withdrawAmount';
  const value = amount(id);
  if (kind === 'withdraw' && value > await bank.checkBalance()) throw new Error('ยอดเงินฝากไม่เพียงพอสำหรับถอน');
  $('transaction').hidden = true;
  status('กรุณาตรวจสอบและยืนยันรายการใน MetaMask');
  const tx = kind === 'deposit' ? await bank.deposit({value}) : await bank.withdraw(value);
  $('transaction').href = 'https://sepolia.etherscan.io/tx/' + tx.hash;
  $('transaction').hidden = false;
  status('ส่งธุรกรรมแล้ว กำลังรอการยืนยันบน Blockchain…');
  await tx.wait();
  $(id).value = '';
  status(kind === 'deposit' ? 'ฝากเงินสำเร็จ' : 'ถอนเงินสำเร็จ');
  try { await refresh(); } catch { status('ธุรกรรมสำเร็จ แต่ยังอ่านยอดใหม่ไม่ได้ กรุณากดตรวจสอบยอดเงินอีกครั้ง'); }
}
$('deposit').onclick = () => run(() => transact('deposit'));
$('withdraw').onclick = () => run(() => transact('withdraw'));
function reset() {
  provider = signer = account = undefined;
  $('balance').textContent = '—';
  $('account').textContent = 'บัญชีหรือเครือข่ายเปลี่ยน กรุณาเชื่อมต่อใหม่';
  $('connect').textContent = 'เชื่อมต่อ MetaMask';
  status('กรุณาเชื่อมต่อกระเป๋าใหม่เพื่อใช้บัญชีและเครือข่ายปัจจุบัน');
}
if (window.ethereum) {
  const injected = wallet();
  injected.on?.('accountsChanged', reset);
  injected.on?.('chainChanged', reset);
}
