export function convertToCSV(data) {
    const csvRows = [];

    // Use custom headers
    const headers = ['Website or link', 'Email'];
    csvRows.push(headers.join(','));

    // Format the data
    for (const row of data) {
        const values = [
            `"${('' + row.url).replace(/"/g, '\"')}"`,
            `"${('' + row.value).replace(/"/g, '\"')}"`
        ];
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}