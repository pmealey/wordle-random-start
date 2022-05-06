using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Comment : CommentSource
    {
        public int Id { get; set; }
        [Required]
        public DateTime Timestamp { get; set; }
        [Required]
        [Column(TypeName="Date")]
        public DateTime Date { get; set; }
        [Required]
        [MaxLength(128)]
        public string Category { get; set; } = null!;
        [Required]
        [MaxLength(128)]
        public string User { get; set; } = null!;

        public Comment()
        {
            Timestamp = DateTime.UtcNow;
        }
    }
}
