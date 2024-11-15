import { useState, useEffect } from 'react'
import { TextInput, Radio, Button, Table, Group, Modal } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import "./style.css"

interface Customer {
  id: number
  name: string
  address: string
  serviceFeeApplicable: boolean
  driverTipApplicable: boolean
  deliveryChargeApplicable: boolean
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      address: '',
      serviceFeeApplicable: true,
      driverTipApplicable: false,
      deliveryChargeApplicable: false,
    },
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch customers',
        color: 'red',
      })
    }
  }

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!response.ok) throw new Error('Failed to add customer')
      await fetchCustomers()
      form.reset()
      notifications.show({
        title: 'Success',
        message: 'Customer added successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add customer',
        color: 'red',
      })
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    form.setValues(customer)
    setIsModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingCustomer) return
    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values),
      })
      if (!response.ok) throw new Error('Failed to update customer')
      await fetchCustomers()
      setIsModalOpen(false)
      setEditingCustomer(null)
      notifications.show({
        title: 'Success',
        message: 'Customer updated successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update customer',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete customer')
      await fetchCustomers()
      notifications.show({
        title: 'Success',
        message: 'Customer deleted successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete customer',
        color: 'red',
      })
    }
  }

  return (
    <div className="p-4 space-y-8">
      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
        <TextInput
          label="Customer Name"
          placeholder="Enter customer name"
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Customer Address"
          placeholder="Enter customer address"
          required
          {...form.getInputProps('address')}
        />
        <Radio.Group
          label="Service Fee Applicable"
          {...form.getInputProps('serviceFeeApplicable')}
        >
          <Group mt="xs">
            <Radio value={"true"} label="Yes" />
            <Radio value={"false"} label="No" />
          </Group>
        </Radio.Group>
        <Radio.Group
          label="Driver Tip Applicable"
          {...form.getInputProps('driverTipApplicable')}
        >
          <Group mt="xs">
            <Radio value={"true"} label="Yes" />
            <Radio value={"false"} label="No" />
          </Group>
        </Radio.Group>
        <Radio.Group
          label="Delivery Charge Applicable"
          {...form.getInputProps('deliveryChargeApplicable')}
        >
          <Group mt="xs">
            <Radio value={"true"} label="Yes" />
            <Radio value={"false"} label="No" />
          </Group>
        </Radio.Group>
        <Button type="submit">Add Customer</Button>
      </form>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Service Fee</th>
            <th>Driver Tip</th>
            <th>Delivery Charge</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.address}</td>
              <td>{customer.serviceFeeApplicable ? 'Yes' : 'No'}</td>
              <td>{customer.driverTipApplicable ? 'Yes' : 'No'}</td>
              <td>{customer.deliveryChargeApplicable ? 'Yes' : 'No'}</td>
              <td>
                <Group>
                  <Button onClick={() => handleEdit(customer)} variant="outline" size="xs">
                    <IconEdit size={16} />
                  </Button>
                  <Button onClick={() => handleDelete(customer.id)} variant="outline" color="red" size="xs">
                    <IconTrash size={16} />
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Customer">
        <form onSubmit={form.onSubmit(handleUpdate)} className="space-y-4">
          <TextInput
            label="Customer Name"
            placeholder="Enter customer name"
            required
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Customer Address"
            placeholder="Enter customer address"
            required
            {...form.getInputProps('address')}
          />
          <Radio.Group
            label="Service Fee Applicable"
            {...form.getInputProps('serviceFeeApplicable')}
          >
            <Group mt="xs">
              <Radio value={"true"} label="Yes" />
              <Radio value={"false"} label="No" />
            </Group>
          </Radio.Group>
          <Radio.Group
            label="Driver Tip Applicable"
            {...form.getInputProps('driverTipApplicable')}
          >
            <Group mt="xs">
              <Radio value={"true"} label="Yes" />
              <Radio value={"false"} label="No" />
            </Group>
          </Radio.Group>
          <Radio.Group
            label="Delivery Charge Applicable"
            {...form.getInputProps('deliveryChargeApplicable')}
          >
            <Group mt="xs">
              <Radio value={"true"} label="Yes" />
              <Radio value={"false"} label="No" />
            </Group>
          </Radio.Group>
          <Button type="submit">Update Customer</Button>
        </form>
      </Modal>
    </div>
  )
}