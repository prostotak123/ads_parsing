import {
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer
} from '@mui/material';

function DataPage() {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Link Funk</TableCell>
            <TableCell>Media</TableCell>
            <TableCell>Text</TableCell>
            <TableCell>Creation Date</TableCell>
            <TableCell>Platform</TableCell>
            <TableCell>Geo</TableCell>
            <TableCell>Languages</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Stats</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <a href="https://facebook.com/profile/123" target="_blank" rel="noreferrer">
                profile/123
              </a>
            </TableCell>
            <TableCell>
              <img src="https://cdn.site/image1.jpg" alt="media" width={80} />
            </TableCell>
            <TableCell>Реклама продукту А. Велика кампанія.</TableCell>
            <TableCell>2024-07-20</TableCell>
            <TableCell>Facebook</TableCell>
            <TableCell>Україна</TableCell>
            <TableCell>uk, en</TableCell>
            <TableCell>
              <a href="https://example.com/product-a" target="_blank" rel="noreferrer">
                product-a
              </a>
            </TableCell>
            <TableCell>
              18-24, UA, male: 1234<br />
              25-34, UA, female: 980
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <a href="https://facebook.com/profile/456" target="_blank" rel="noreferrer">
                profile/456
              </a>
            </TableCell>
            <TableCell>
              <img src="https://cdn.site/image2.jpg" alt="media" width={80} />
            </TableCell>
            <TableCell>Реклама продукту B з таргетом на Європу.</TableCell>
            <TableCell>2024-07-21</TableCell>
            <TableCell>Instagram</TableCell>
            <TableCell>Польща</TableCell>
            <TableCell>pl, en</TableCell>
            <TableCell>
              <a href="https://example.com/product-b" target="_blank" rel="noreferrer">
                product-b
              </a>
            </TableCell>
            <TableCell>
              18-24, PL, female: 640<br />
              35-44, PL, male: 330
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataPage;
