import { RoomTemplate, RoomType } from '@/types'

export const roomTemplates: Record<RoomType, RoomTemplate> = {
  kitchen: {
    type: 'kitchen',
    displayName: 'Kitchen',
    icon: 'ChefHat',
    items: [
      { text: 'Refrigerator - exterior clean, no dents', category: 'Appliances' },
      { text: 'Refrigerator - interior clean, no odors', category: 'Appliances' },
      { text: 'Stove/Oven - exterior clean, burners functional', category: 'Appliances' },
      { text: 'Stove/Oven - interior clean, no grease buildup', category: 'Appliances' },
      { text: 'Dishwasher - exterior clean, no leaks', category: 'Appliances' },
      { text: 'Dishwasher - interior clean, drains properly', category: 'Appliances' },
      { text: 'Microwave - clean inside and out', category: 'Appliances' },
      { text: 'Range hood/Exhaust fan - clean, functional', category: 'Appliances' },
      { text: 'Kitchen sink - clean, no scratches or stains', category: 'Plumbing' },
      { text: 'Kitchen faucet - functional, no leaks', category: 'Plumbing' },
      { text: 'Garbage disposal - functional, clean', category: 'Plumbing' },
      { text: 'Under-sink area - no water damage or leaks', category: 'Plumbing' },
      { text: 'Countertops - clean, no damage or stains', category: 'Surfaces' },
      { text: 'Backsplash - clean, no missing tiles', category: 'Surfaces' },
      { text: 'Cabinets - doors/drawers functional, clean inside', category: 'Cabinets' },
      { text: 'Cabinet hardware - all knobs/handles present', category: 'Cabinets' },
      { text: 'Pantry/Storage areas - clean, no damage', category: 'Storage' },
      { text: 'Flooring - clean, no damage or stains', category: 'Flooring' },
      { text: 'Walls - no holes, stains, or excessive wear', category: 'Walls/Paint' },
      { text: 'Light fixtures - all bulbs working, clean', category: 'Electrical' },
      { text: 'Electrical outlets - all functional', category: 'Electrical' },
      { text: 'Windows - clean, screens intact', category: 'Windows' }
    ]
  },
  bathroom: {
    type: 'bathroom',
    displayName: 'Bathroom',
    icon: 'Bath',
    items: [
      { text: 'Toilet - clean, functional, no leaks', category: 'Fixtures' },
      { text: 'Toilet seat and lid - secure, undamaged', category: 'Fixtures' },
      { text: 'Bathtub/Shower - clean, no mold or mildew', category: 'Fixtures' },
      { text: 'Shower head - clean, proper water pressure', category: 'Fixtures' },
      { text: 'Shower door/Curtain rod - functional, clean', category: 'Fixtures' },
      { text: 'Bathroom sink - clean, no chips or cracks', category: 'Fixtures' },
      { text: 'Bathroom faucet - functional, no leaks', category: 'Plumbing' },
      { text: 'Drain stoppers - present and functional', category: 'Plumbing' },
      { text: 'Under-sink plumbing - no leaks or water damage', category: 'Plumbing' },
      { text: 'Bathroom vanity/Countertop - clean, no damage', category: 'Surfaces' },
      { text: 'Medicine cabinet/Mirror - clean, secure', category: 'Storage' },
      { text: 'Bathroom tiles - clean, no missing/cracked tiles', category: 'Surfaces' },
      { text: 'Tile grout - clean, no mold or discoloration', category: 'Surfaces' },
      { text: 'Flooring - clean, no water damage', category: 'Flooring' },
      { text: 'Walls - no holes, mold, or excessive wear', category: 'Walls/Paint' },
      { text: 'Exhaust fan - functional, clean', category: 'Ventilation' },
      { text: 'Light fixtures - all bulbs working, clean', category: 'Electrical' },
      { text: 'Electrical outlets (GFCI) - functional', category: 'Electrical' },
      { text: 'Towel bars/Hooks - secure, undamaged', category: 'Hardware' },
      { text: 'Toilet paper holder - secure, functional', category: 'Hardware' },
      { text: 'Windows - clean, privacy intact', category: 'Windows' }
    ]
  },
  bedroom: {
    type: 'bedroom',
    displayName: 'Bedroom',
    icon: 'Bed',
    items: [
      { text: 'Walls - no holes, stains, or excessive wear', category: 'Walls/Paint' },
      { text: 'Ceiling - no cracks, stains, or damage', category: 'Walls/Paint' },
      { text: 'Flooring - clean, no damage or excessive wear', category: 'Flooring' },
      { text: 'Baseboards/Trim - clean, no damage', category: 'Trim' },
      { text: 'Windows - clean, open/close properly', category: 'Windows' },
      { text: 'Window screens - intact, no tears', category: 'Windows' },
      { text: 'Window sills - clean, no water damage', category: 'Windows' },
      { text: 'Blinds/Curtain hardware - functional', category: 'Window Treatments' },
      { text: 'Closet doors - open/close properly, on track', category: 'Closets' },
      { text: 'Closet interior - clean, no damage', category: 'Closets' },
      { text: 'Closet rod/Shelving - secure, functional', category: 'Closets' },
      { text: 'Bedroom door - opens/closes properly', category: 'Doors' },
      { text: 'Door hardware - lock/handle functional', category: 'Doors' },
      { text: 'Light fixtures - all bulbs working, clean', category: 'Electrical' },
      { text: 'Light switches - all functional', category: 'Electrical' },
      { text: 'Electrical outlets - all functional', category: 'Electrical' },
      { text: 'Ceiling fan (if applicable) - functional, clean', category: 'Electrical' },
      { text: 'Heating/AC vents - clean, unobstructed', category: 'HVAC' }
    ]
  },
  'living-room': {
    type: 'living-room',
    displayName: 'Living Room',
    icon: 'Sofa',
    items: [
      { text: 'Walls - no holes, stains, or excessive wear', category: 'Walls/Paint' },
      { text: 'Ceiling - no cracks, stains, or damage', category: 'Walls/Paint' },
      { text: 'Flooring - clean, no damage or excessive wear', category: 'Flooring' },
      { text: 'Baseboards/Trim - clean, no damage', category: 'Trim' },
      { text: 'Windows - clean, open/close properly', category: 'Windows' },
      { text: 'Window screens - intact, no tears', category: 'Windows' },
      { text: 'Window sills - clean, no water damage', category: 'Windows' },
      { text: 'Blinds/Curtain hardware - functional', category: 'Window Treatments' },
      { text: 'Entry door - opens/closes properly', category: 'Doors' },
      { text: 'Door hardware - lock/handle functional', category: 'Doors' },
      { text: 'Fireplace (if applicable) - clean, screen present', category: 'Fireplace' },
      { text: 'Fireplace damper (if applicable) - functional', category: 'Fireplace' },
      { text: 'Built-in shelving - clean, secure', category: 'Built-ins' },
      { text: 'Light fixtures - all bulbs working, clean', category: 'Electrical' },
      { text: 'Light switches - all functional', category: 'Electrical' },
      { text: 'Electrical outlets - all functional', category: 'Electrical' },
      { text: 'Cable/Internet outlets - functional', category: 'Electrical' },
      { text: 'Ceiling fan (if applicable) - functional, clean', category: 'Electrical' },
      { text: 'Heating/AC vents - clean, unobstructed', category: 'HVAC' },
      { text: 'Thermostat - functional, programmed correctly', category: 'HVAC' }
    ]
  },
  general: {
    type: 'general',
    displayName: 'General Areas',
    icon: 'Home',
    items: [
      { text: 'Hallways - walls clean, no damage', category: 'Interior' },
      { text: 'Stairways - clean, railings secure', category: 'Interior' },
      { text: 'Entry areas - clean, no damage', category: 'Interior' },
      { text: 'Laundry area - clean, connections secure', category: 'Utilities' },
      { text: 'Water heater area - clean, no leaks', category: 'Utilities' },
      { text: 'Furnace/HVAC unit - clean, accessible', category: 'HVAC' },
      { text: 'Air filters - replaced with clean ones', category: 'HVAC' },
      { text: 'Attic access - clean, insulation intact', category: 'Storage' },
      { text: 'Basement/Crawl space - clean, no moisture issues', category: 'Storage' },
      { text: 'Garage - clean, no stains or damage', category: 'Exterior' },
      { text: 'Garage door - functional, remote works', category: 'Exterior' },
      { text: 'Exterior doors - functional, weatherstripping intact', category: 'Exterior' },
      { text: 'Outdoor lighting - all fixtures working', category: 'Exterior' },
      { text: 'Mailbox - clean, functional', category: 'Exterior' },
      { text: 'Yard/Landscaping - maintained per lease terms', category: 'Exterior' },
      { text: 'Sprinkler system (if applicable) - functional', category: 'Exterior' },
      { text: 'Deck/Patio - clean, no damage', category: 'Exterior' },
      { text: 'Driveway/Walkways - clean, no stains', category: 'Exterior' },
      { text: 'Keys - all provided keys returned', category: 'Security' },
      { text: 'Garage remotes - all remotes returned', category: 'Security' },
      { text: 'Smoke detectors - functional, batteries replaced', category: 'Safety' },
      { text: 'Carbon monoxide detectors - functional', category: 'Safety' }
    ]
  }
}

export function getRoomTemplate(type: RoomType): RoomTemplate {
  return roomTemplates[type]
}

export function getAllRoomTypes(): RoomType[] {
  return Object.keys(roomTemplates) as RoomType[]
}

export function createRoomFromTemplate(type: RoomType, customName?: string) {
  const template = getRoomTemplate(type)
  
  return {
    id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: customName || template.displayName,
    type: template.type,
    items: template.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item,
      completed: false,
      photos: [],
      videos: []
    })),
    completedItems: 0,
    totalItems: template.items.length,
    progressPercentage: 0,
    lastModified: new Date().toISOString()
  }
}