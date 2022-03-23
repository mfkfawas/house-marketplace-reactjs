const formatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function formatMoney(cost) {
  return formatter.format(cost);
}
