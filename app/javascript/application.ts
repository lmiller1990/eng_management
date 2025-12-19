// Import Turbo for SPA-like navigation
import "@hotwired/turbo-rails"

// TypeScript Hello World Example
const message: string = "Hello World from TypeScript with jsbundling-rails!"
console.log(message)

// Type-safe example
interface GreetingConfig {
  name: string
  timestamp: Date
}

function greet(config: GreetingConfig): string {
  return `Hello ${config.name}! Current time: ${config.timestamp.toLocaleString()}`
}

const greeting = greet({
  name: "Rails Developer",
  timestamp: new Date()
})

console.log(greeting)

// Log to confirm TypeScript is working
console.log("✅ TypeScript is successfully configured!")
