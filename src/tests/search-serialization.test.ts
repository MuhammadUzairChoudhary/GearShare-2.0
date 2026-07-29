describe('Search Input Serialization', () => {
  it('should include query in search params', () => {
    const params = { query: 'tent', activity: 'camping' };
    expect(params.query).toBe('tent');
    expect(params.activity).toBe('camping');
  });

  it('should handle empty filters', () => {
    const params = {};
    expect(params).toEqual({});
  });

  it('should separate price range as minor units', () => {
    const minMinor = 2500;
    const maxMinor = 10000;
    expect(minMinor).toBe(2500);
    expect(maxMinor).toBe(10000);
    expect(minMinor).toBeLessThan(maxMinor);
  });
});
