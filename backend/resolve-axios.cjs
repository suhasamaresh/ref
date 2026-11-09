try {
  console.log(require.resolve('axios'));
} catch (e) {
  console.error('resolve failed:', e && e.message);
  process.exit(1);
}
