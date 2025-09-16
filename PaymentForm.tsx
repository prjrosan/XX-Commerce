import { useState } from 'react'
import { CreditCard, Smartphone, Building, Truck, QrCode, Wallet, Banknote } from 'lucide-react'
import { PaymentRequest } from '../types'

interface PaymentFormProps {
  amount: number
  onSubmit: (paymentData: PaymentRequest) => void
  loading?: boolean
}

export default function PaymentForm({ amount, onSubmit, loading = false }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit_card' | 'paypay' | 'bank_transfer' | 'cash_on_delivery' | 'konbini' | 'banking'>('credit_card')
  const [formData, setFormData] = useState({
    card_number: '',
    card_holder: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    paypay_phone: '',
    paypay_email: '',
    bank_name: '',
    account_number: '',
    bank_code: '',
    branch_code: '',
    account_holder: '',
    konbini_store: '',
    banking_username: '',
    banking_password: ''
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const paymentData: PaymentRequest = {
      payment_method: paymentMethod,
      payment_details: formData
    }
    
    onSubmit(paymentData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, ' ').trim()
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''))
    setFormData(prev => ({
      ...prev,
      card_number: formatted
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">�� お支払い方法</h2>
      
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-xl font-bold text-blue-900">
          合計金額: {formatPrice(amount)}
        </div>
        <div className="text-sm text-blue-700 mt-1">
          税込・送料込
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            お支払い方法を選択してください
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Credit Card */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="flex flex-col items-center space-y-2">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <span className="font-medium text-gray-800">クレジットカード</span>
                <div className="flex space-x-1">
                  <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">V</div>
                  <div className="w-6 h-4 bg-red-600 rounded text-white text-xs flex items-center justify-center">M</div>
                  <div className="w-6 h-4 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">J</div>
                </div>
              </div>
            </div>

            {/* Debit Card */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('debit_card')}
            >
              <div className="flex flex-col items-center space-y-2">
                <CreditCard className="h-8 w-8 text-green-600" />
                <span className="font-medium text-gray-800">デビットカード</span>
                <div className="text-xs text-gray-600">即時決済</div>
              </div>
            </div>

            {/* PayPay */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('paypay')}
            >
              <div className="flex flex-col items-center space-y-2">
                <QrCode className="h-8 w-8 text-yellow-600" />
                <span className="font-medium text-gray-800">PayPay</span>
                <div className="text-xs text-gray-600">QRコード決済</div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('bank_transfer')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Building className="h-8 w-8 text-purple-600" />
                <span className="font-medium text-gray-800">銀行振込</span>
                <div className="text-xs text-gray-600">1-3営業日</div>
              </div>
            </div>

            {/* Online Banking */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('banking')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Wallet className="h-8 w-8 text-indigo-600" />
                <span className="font-medium text-gray-800">ネットバンキング</span>
                <div className="text-xs text-gray-600">即時決済</div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('cash_on_delivery')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Truck className="h-8 w-8 text-orange-600" />
                <span className="font-medium text-gray-800">代金引換</span>
                <div className="text-xs text-gray-600">現金払い</div>
              </div>
            </div>

            {/* Konbini Payment */}
            <div
              className={p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 }
              onClick={() => setPaymentMethod('konbini')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Banknote className="h-8 w-8 text-red-600" />
                <span className="font-medium text-gray-800">コンビニ決済</span>
                <div className="text-xs text-gray-600">店頭支払い</div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit/Debit Card Fields */}
        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {paymentMethod === 'credit_card' ? 'クレジットカード情報' : 'デビットカード情報'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カード番号 *
              </label>
              <input
                type="text"
                name="card_number"
                value={formData.card_number}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                required
                className="input w-full"
                maxLength={19}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カード名義人 *
              </label>
              <input
                type="text"
                name="card_holder"
                value={formData.card_holder}
                onChange={handleInputChange}
                placeholder="TANAKA TARO"
                required
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限（月） *
                </label>
                <select
                  name="expiry_month"
                  value={formData.expiry_month}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">月</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限（年） *
                </label>
                <select
                  name="expiry_year"
                  value={formData.expiry_year}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                >
                  <option value="">年</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={(new Date().getFullYear() + i).toString()}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                  className="input w-full"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* PayPay Fields */}
        {paymentMethod === 'paypay' && (
          <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PayPay情報</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 *
              </label>
              <input
                type="tel"
                name="paypay_phone"
                value={formData.paypay_phone}
                onChange={handleInputChange}
                placeholder="090-1234-5678"
                required
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス *
              </label>
              <input
                type="email"
                name="paypay_email"
                value={formData.paypay_email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
                className="input w-full"
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📱 PayPayアプリでQRコードをスキャンして決済を完了してください。
              </p>
            </div>
          </div>
        )}

        {/* Bank Transfer Fields */}
        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">銀行振込情報</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  銀行名 *
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  placeholder="三菱UFJ銀行"
                  required
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  銀行コード *
                </label>
                <input
                  type="text"
                  name="bank_code"
                  value={formData.bank_code}
                  onChange={handleInputChange}
                  placeholder="0005"
                  required
                  className="input w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支店名 *
                </label>
                <input
                  type="text"
                  name="branch_code"
                  value={formData.branch_code}
                  onChange={handleInputChange}
                  placeholder="新宿支店"
                  required
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  口座番号 *
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="1234567"
                  required
                  className="input w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                口座名義人 *
              </label>
              <input
                type="text"
                name="account_holder"
                value={formData.account_holder}
                onChange={handleInputChange}
                placeholder="タナカ タロウ"
                required
                className="input w-full"
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 銀行振込は1-3営業日で処理されます。振込手数料はお客様負担となります。
              </p>
            </div>
          </div>
        )}

        {/* Online Banking Fields */}
        {paymentMethod === 'banking' && (
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ネットバンキング情報</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID *
              </label>
              <input
                type="text"
                name="banking_username"
                value={formData.banking_username}
                onChange={handleInputChange}
                placeholder="your_banking_id"
                required
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード *
              </label>
              <input
                type="password"
                name="banking_password"
                value={formData.banking_password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="input w-full"
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🔐 セキュアな接続で決済を処理します。情報は暗号化されて送信されます。
              </p>
            </div>
          </div>
        )}

        {/* Cash on Delivery */}
        {paymentMethod === 'cash_on_delivery' && (
          <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-3 text-orange-800 mb-3">
              <Truck className="h-8 w-8" />
              <span className="text-xl font-bold">代金引換</span>
            </div>
            <p className="text-orange-700 mb-4">
              商品をお受け取りの際に現金でお支払いください。
            </p>
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-gray-600">
                💰 代金引換手数料: 330円（税込）
              </p>
              <p className="text-sm text-gray-600">
                📦 お支払い総額: {formatPrice(amount + 330)}
              </p>
            </div>
          </div>
        )}

        {/* Konbini Payment */}
        {paymentMethod === 'konbini' && (
          <div className="space-y-4 p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">コンビニ決済</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コンビニ店舗 *
              </label>
              <select
                name="konbini_store"
                value={formData.konbini_store}
                onChange={handleInputChange}
                required
                className="input w-full"
              >
                <option value="">店舗を選択してください</option>
                <option value="seven_eleven">セブン-イレブン</option>
                <option value="family_mart">ファミリーマート</option>
                <option value="lawson">ローソン</option>
                <option value="ministop">ミニストップ</option>
                <option value="daily_yamazaki">デイリーヤマザキ</option>
              </select>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🏪 選択したコンビニ店舗で支払い番号を提示して現金でお支払いください。
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? '処理中...' : ${formatPrice(amount)} を支払う}
        </button>
      </form>
    </div>
  )
}
