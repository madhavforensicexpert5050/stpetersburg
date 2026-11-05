export type StyleId = 'modern' | 'scandinavian' | 'farmhouse' | 'contemporary' | 'industrial' | 'traditional' | 'coastal' | 'transitional';
export type RoomId = 'living-room' | 'primary-bedroom' | 'guest-bedroom' | 'childrens-bedroom' | 'dining-room' | 'home-office' | 'kitchen' | 'basement' | 'entryway' | 'sunroom' | 'patio' | 'porch' | 'deck';

export interface StyleInfo { id: StyleId; name: string; note: string; materials: string; hasPage: boolean; palette: { wall: string; sofa: string; wood: string; accent: string; rug: string; metal: string; round: boolean } }

export const styles: StyleInfo[] = [
  { id: 'modern', name: 'Modern', hasPage: true, note: 'Clean lines, low profiles and very little on the surfaces.', materials: 'Charcoal upholstery, black metal, walnut', palette: { wall: '#EDEEEC', sofa: '#3C4650', wood: '#7A5236', accent: '#E4572E', rug: '#C9CDCB', metal: '#1B1F23', round: false } },
  { id: 'scandinavian', name: 'Scandinavian', hasPage: true, note: 'Pale woods, soft textiles and a bright, airy feel.', materials: 'Oatmeal fabric, pale oak, wool', palette: { wall: '#F3F2EC', sofa: '#CFCABD', wood: '#D2B48C', accent: '#6E8F8B', rug: '#E7E3D8', metal: '#8B8F8D', round: true } },
  { id: 'farmhouse', name: 'Farmhouse', hasPage: true, note: 'Sturdy shapes, painted wood and a lived-in warmth.', materials: 'Linen slipcovers, reclaimed-look wood, iron', palette: { wall: '#F0EBE0', sofa: '#B9B09C', wood: '#8C6239', accent: '#46624F', rug: '#A9A08C', metal: '#2C2B28', round: false } },
  { id: 'contemporary', name: 'Contemporary', hasPage: true, note: 'Current shapes and curves in layered, neutral tones.', materials: 'Boucle, brushed brass, smoked glass', palette: { wall: '#E9E6E1', sofa: '#A88F7A', wood: '#5D4636', accent: '#B98B2F', rug: '#D7CFC4', metal: '#A98743', round: true } },
  { id: 'industrial', name: 'Industrial', hasPage: false, note: 'Dark metal and leather that suit lofts and open plans.', materials: 'Cognac leather, blackened steel', palette: { wall: '#DCD9D3', sofa: '#7B4A2B', wood: '#4A3A2C', accent: '#B5532C', rug: '#6F6F6C', metal: '#232323', round: false } },
  { id: 'traditional', name: 'Traditional', hasPage: false, note: 'Classic proportions, turned legs and balanced pairs.', materials: 'Navy fabric, cherry wood, brass', palette: { wall: '#EFE9DD', sofa: '#2F4A6B', wood: '#6B3E26', accent: '#B4924A', rug: '#8E5A4A', metal: '#A98743', round: true } },
  { id: 'coastal', name: 'Coastal', hasPage: false, note: 'Sea-glass color, woven texture and light finishes.', materials: 'Sea-glass fabric, rattan, whitewashed wood', palette: { wall: '#F2F5F2', sofa: '#9CC4C4', wood: '#C9AE86', accent: '#2F7F8F', rug: '#E9E4D4', metal: '#B8BDB9', round: true } },
  { id: 'transitional', name: 'Transitional', hasPage: false, note: 'A quiet middle ground between classic and current.', materials: 'Greige fabric, mid-tone oak, pewter', palette: { wall: '#ECE9E3', sofa: '#8F8B84', wood: '#94714F', accent: '#5B6C7A', rug: '#CFC9BE', metal: '#6F7375', round: false } },
];

export const rooms: { id: RoomId; name: string; outdoor?: boolean }[] = [
  { id: 'living-room', name: 'Living Room' },
  { id: 'primary-bedroom', name: 'Primary Bedroom' },
  { id: 'guest-bedroom', name: 'Guest Bedroom' },
  { id: 'childrens-bedroom', name: "Children's Bedroom" },
  { id: 'dining-room', name: 'Dining Room' },
  { id: 'home-office', name: 'Home Office' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'basement', name: 'Basement' },
  { id: 'entryway', name: 'Entryway' },
  { id: 'sunroom', name: 'Sunroom' },
  { id: 'patio', name: 'Patio', outdoor: true },
  { id: 'porch', name: 'Porch', outdoor: true },
  { id: 'deck', name: 'Deck', outdoor: true },
];
