export const getYearRange = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= 2000; year--) {
        years.push(year)
    }
    return years
}