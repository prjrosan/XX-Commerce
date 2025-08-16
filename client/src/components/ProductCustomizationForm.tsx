import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface CustomizationOption {
  type: string
  values: string[]
  priceAdjustment: number
  required: boolean
}

interface ProductCustomizationFormProps {
  productId: number
  initialCustomization?: any
  onSave: (customization: any) => void
  onCancel: () => void
}

export default function ProductCustomizationForm({
  // productId,
  initialCustomization = {},
  onSave,
  onCancel
}: ProductCustomizationFormProps) {
  const [customization, setCustomization] = useState<Record<string, CustomizationOption>>(
    initialCustomization
  )
  const [newOption, setNewOption] = useState<CustomizationOption>({
    type: '',
    values: [],
    priceAdjustment: 0,
    required: false
  })

  const optionTypes = [
    'colors',
    'sizes',
    'materials',
    'patterns',
    'engraving',
    'packaging',
    'handle_materials',
    'blade_lengths',
    'grades',
    'bands',
    'bases'
  ]

  const handleAddOption = () => {
    if (!newOption.type || newOption.values.length === 0) {
      toast.error('Please fill in all fields')
      return
    }

    setCustomization(prev => ({
      ...prev,
      [newOption.type]: newOption
    }))

    setNewOption({
      type: '',
      values: [],
      priceAdjustment: 0,
      required: false
    })

    toast.success('Customization option added')
  }

  const handleRemoveOption = (type: string) => {
    setCustomization(prev => {
      const newCustomization = { ...prev }
      delete newCustomization[type]
      return newCustomization
    })
    toast.success('Customization option removed')
  }

  const handleSave = () => {
    onSave(customization)
  }

  const handleValuesChange = (values: string) => {
    const valuesArray = values.split(',').map(v => v.trim()).filter(v => v)
    setNewOption(prev => ({ ...prev, values: valuesArray }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Customization Options</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Customization</span>
          </button>
        </div>
      </div>

      {/* Add New Option */}
      <div className="card p-6">
        <h4 className="text-md font-semibold mb-4">Add New Customization Option</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="option-type" className="block text-sm font-medium mb-2">Option Type</label>
            <select
              id="option-type"
              value={newOption.type}
              onChange={(e) => setNewOption(prev => ({ ...prev, type: e.target.value }))}
              className="input w-full"
            >
              <option value="">Select Type</option>
              {optionTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Values (comma-separated)</label>
            <input
              type="text"
              value={newOption.values.join(', ')}
              onChange={(e) => handleValuesChange(e.target.value)}
              className="input w-full"
              placeholder="Black, White, Blue, Red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price Adjustment (¥)</label>
            <input
              type="number"
              value={newOption.priceAdjustment}
              onChange={(e) => setNewOption(prev => ({ ...prev, priceAdjustment: Number(e.target.value) }))}
              className="input w-full"
              placeholder="0"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newOption.required}
                onChange={(e) => setNewOption(prev => ({ ...prev, required: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Required</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleAddOption}
          className="btn btn-primary mt-4 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Option</span>
        </button>
      </div>

      {/* Existing Options */}
      {Object.keys(customization).length > 0 && (
        <div className="card p-6">
          <h4 className="text-md font-semibold mb-4">Current Customization Options</h4>
          <div className="space-y-4">
            {Object.entries(customization).map(([type, option]) => (
              <div key={type} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <h5 className="font-medium capitalize">
                    {type.replace('_', ' ')}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Values: {option.values.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price Adjustment: ¥{option.priceAdjustment}
                    {option.required && ' • Required'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveOption(type)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title={`Remove ${type} option`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customization Templates */}
      <div className="card p-6">
        <h4 className="text-md font-semibold mb-4">Quick Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setCustomization({
                colors: {
                  type: 'colors',
                  values: ['Black', 'White', 'Blue', 'Red'],
                  priceAdjustment: 0,
                  required: false
                },
                sizes: {
                  type: 'sizes',
                  values: ['S', 'M', 'L', 'XL'],
                  priceAdjustment: 0,
                  required: true
                }
              })
              toast.success('Electronics template applied')
            }}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h5 className="font-medium">Electronics</h5>
            <p className="text-sm text-gray-600">Colors + Sizes</p>
          </button>

          <button
            onClick={() => {
              setCustomization({
                sizes: {
                  type: 'sizes',
                  values: ['S', 'M', 'L', 'XL'],
                  priceAdjustment: 0,
                  required: true
                },
                colors: {
                  type: 'colors',
                  values: ['Blue', 'Pink', 'Purple', 'Green'],
                  priceAdjustment: 0,
                  required: false
                },
                patterns: {
                  type: 'patterns',
                  values: ['Cherry Blossom', 'Wave', 'Geometric', 'Floral'],
                  priceAdjustment: 500,
                  required: false
                }
              })
              toast.success('Clothing template applied')
            }}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h5 className="font-medium">Clothing</h5>
            <p className="text-sm text-gray-600">Sizes + Colors + Patterns</p>
          </button>

          <button
            onClick={() => {
              setCustomization({
                handle_materials: {
                  type: 'handle_materials',
                  values: ['Wood', 'Bamboo', 'Composite'],
                  priceAdjustment: 0,
                  required: true
                },
                blade_lengths: {
                  type: 'blade_lengths',
                  values: ['180mm', '210mm', '240mm'],
                  priceAdjustment: 1000,
                  required: true
                },
                engraving: {
                  type: 'engraving',
                  values: ['Available'],
                  priceAdjustment: 2000,
                  required: false
                }
              })
              toast.success('Kitchen template applied')
            }}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h5 className="font-medium">Kitchen</h5>
            <p className="text-sm text-gray-600">Materials + Lengths + Engraving</p>
          </button>
        </div>
      </div>
    </div>
  )
} 