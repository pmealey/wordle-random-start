using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DailyWord
    {
        [Key]
        [Column(TypeName="Date")]
        public DateTime Date { get; set; }
        [MaxLength(5)]
        public string Word { get; set; } = null!;
    }
}