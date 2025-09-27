// useRecommendations.js
useEffect(() => {
    const fetchSuggestions = async () => {
      const res = await fetch(`/api/recommend/${userId}`)
      setSuggestions(await res.json())
    }
    fetchSuggestions()
  }, [userId])