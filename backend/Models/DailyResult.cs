using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DailyResult
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(128)]
        public string User { get; set; } = null!;
        [Required]
        [Column(TypeName="Date")]
        public DateTime Date { get; set; }
        [Required]
        [MaxLength(128)]
        public string Game { get; set; } = null!;
        [Required]
        public string Result { get; set; } = null!;
        public int? Score { get; set; }
        public TimeSpan? Time { get; set; }
        public List<int>? Scores { get; set; }
    }
}
