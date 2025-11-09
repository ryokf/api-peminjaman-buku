const setReturnDate = (borrowDate) => {
    const newDate = new Date(borrowDate)

    if (newDate.getDay() === 0 && newDate.getHours() < 13) {
        newDate.setDate(newDate.getDate() + 14)
    } else {
        const deviation = 7 - newDate.getDay()
        newDate.setDate(newDate.getDate() + deviation + 15)
    }

    return newDate
}

export default setReturnDate