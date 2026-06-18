# @epode/cambia-react

React binding for [`@epode/cambia-runtime`](https://www.npmjs.com/package/@epode/cambia-runtime) —
one provider and the `useCambia` hook for born-adapted, self-personalizing UI.

```bash
npm i @epode/cambia-react @epode/cambia-runtime
```

## Usage

```tsx
import { createCambia } from '@epode/cambia-runtime'
import { CambiaProvider, useCambia } from '@epode/cambia-react'

const cambia = createCambia({ designMd, userId })

function App() {
  return (
    <CambiaProvider value={cambia}>
      <OrdersTable />
    </CambiaProvider>
  )
}

function OrdersTable() {
  const { values, observe } = useCambia('tabular-list')
  return (
    <DataTable
      density={values.density}                              // adapted value
      onDensityChange={(d) => observe({ trait: 'density', value: d })}
      // conserved traits (rows-are-records, sort-by-header, …) are fixed in the component
    />
  )
}
```

`values` holds the born-adapted-then-personalized trait values; conserved traits never appear,
so they can't be adapted. Re-renders only when an adapted value actually changes.

Part of [Cambia](https://github.com/epode-studio/cambia). MIT.
