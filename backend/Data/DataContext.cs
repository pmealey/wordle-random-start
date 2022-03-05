using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base (options)
        { }

        public DbSet<DailyResult> DailyResult { get; set; }

        public DbSet<DailyWord> DailyWord { get; set; }
    }
}