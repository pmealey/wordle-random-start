using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Group
    {
        public string Name { get; set; } = null!;
        public bool SelectGames { get; set; }
        public string? Description { get; set; }
    }
}
