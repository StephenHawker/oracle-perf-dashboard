
# Oracle Performance Dashboard

A modern, full-featured dashboard for Oracle (and SQLite-mock) performance analysis. Built with React, Material-UI, and Node.js/Express backend, it provides deep insights into database health, SQL performance, wait events, system metrics, and ORDS REST API activity.

## Features

- **Dashboard**: High-level summary of database health and key metrics
- **AWR Reports**: Visualize AWR trends, top SQL, and all key metrics (with units)
- **ASH Analysis**: Active Session History with detailed session and wait event breakdowns
- **SQL Analysis**: In-depth SQL statement performance, execution stats, and plan details
- **Wait Events**: Charts and tables for all major wait events, with time waited and counts
- **System Metrics**: Real-time CPU, memory, I/O, and session metrics with charts and summary cards
- **ORDS Monitoring**: REST API call tracking, response times, error rates, and status code analytics
- **Database Config**: Switch between SQLite (mock) and Oracle, configure connection settings
- **Robust Error Handling**: Graceful error boundaries, timeouts, and clear user feedback

## Quick Start

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Run the backend**
   ```sh
   npm run server
   ```
3. **Run the frontend**
   ```sh
   npm start
   ```
4. **Access the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/pages/` — All main dashboard pages (AWR, ASH, SQL, Waits, System, ORDS, Config)
- `src/components/` — Sidebar, error boundaries, and shared UI
- `src/contexts/` — React context for DB connection and filters
- `src/services/` — Database service abstraction (SQLite mock, Oracle ready)
- `src/types/` — TypeScript types for Oracle/ORDS/AWR/ASH data
- `seed_oracle_perf.js` / `seed_oracle_perf.sql` — Data seeding scripts for SQLite

## Data Sources
- **SQLite**: Default for development, uses mock/test data
- **Oracle**: Switch in Database Config (requires Oracle DB and credentials)

## Usage Notes
- All time and metric units are clearly labeled (e.g., seconds, ms, MB/s)
- Sidebar navigation covers all analysis pages
- All tables are sortable and expandable where relevant
- Error messages and loading states are user-friendly

## Customization
- Add new metrics or charts by editing the relevant page in `src/pages/`
- Extend mock data in `src/services/databaseService.ts` or seed scripts
- Update connection logic in `src/contexts/DatabaseContext.tsx`

## License
MIT

---

For questions or contributions, open an issue or pull request on this repository.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
