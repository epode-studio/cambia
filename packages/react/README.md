# React hook to personalize your UI for each user

**`@epode/cambia-react`** lets your React app **adapt its interface to each user** with a single
hook. Each person gets a UI tuned to how they actually use your app — and it all happens on
their device, with no tracking.

```bash
npm i @epode/cambia-react @epode/cambia-runtime
```

## Quick start

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
      density={values.density}                              // tailored to this user
      onDensityChange={(d) => observe({ trait: 'density', value: d })}  // learn from their choice
    />
  )
}
```

- **One hook** — `useCambia('your-component')` returns the settings to render with, already
  personalized, plus an `observe` callback to learn from what the user does.
- **Only re-renders when something actually changes.**
- **Private by default** — preferences live on the device; nothing is sent anywhere.

Part of [Cambia](https://github.com/epode-studio/cambia). Free and open source (MIT).
