package cards

import (
	"context"
	"log"
	"math/rand"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"google.golang.org/api/iterator"
)

type CardType string

const (
	TypeTruth CardType = "TRUTH"
	TypeDare  CardType = "DARE"
)

type Difficulty string

const (
	DifficultyEasy   Difficulty = "EASY"
	DifficultyMedium Difficulty = "MEDIUM"
	DifficultyHard   Difficulty = "HARD"
)

type Category struct {
	ID   string `json:"id" firestore:"id"`
	Name string `json:"name" firestore:"name"`
}

type GameCard struct {
	ID            string     `json:"id" firestore:"id"`
	CategoryID    string     `json:"categoryId" firestore:"categoryId"` // Link to Category
	Category      string     `json:"category" firestore:"category"`     // Denormalized Name for easy frontend display
	Text          string     `json:"text" firestore:"text"`
	Difficulty    Difficulty `json:"difficulty" firestore:"difficulty"`
	Points        int        `json:"points" firestore:"points"`
	Type          CardType   `json:"type" firestore:"type"`
	Answers       []string   `json:"answers,omitempty" firestore:"answers,omitempty"`             // For TRUTH
	CorrectAnswer string     `json:"correctAnswer,omitempty" firestore:"correctAnswer,omitempty"` // For TRUTH
}

type Service struct {
	client     *firestore.Client
	cards      []GameCard
	categories []Category
	ctx        context.Context
}

func NewService(client *firestore.Client) *Service {
	s := &Service{
		client:     client,
		ctx:        context.Background(),
		cards:      []GameCard{},
		categories: []Category{},
	}
	s.loadCategories()
	s.loadCards()
	return s
}

func (s *Service) loadCategories() {
	log.Println("Loading categories from Firestore...")
	iter := s.client.Collection("categories").Documents(s.ctx)
	var loadedCats []Category
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Failed to iterate categories: %v", err)
			return
		}
		var cat Category
		if err := doc.DataTo(&cat); err != nil {
			log.Printf("Failed to parse category data: %v", err)
			continue
		}
		loadedCats = append(loadedCats, cat)
	}
	s.categories = loadedCats
	
	if len(loadedCats) == 0 {
		log.Println("No categories found in Firestore. Seeding default categories...")
		defaults := []string{
			"😂 สังคม & มีมดัง",
			"📺 วัยรุ่น Y2K & ซีรีส์",
			"🎤 T-Pop & เพลงฮิต",
			"💸 ชีวิตติดโปร & ไฟแนนซ์",
			"🍽️ ตำนานอาหาร & ท่องเที่ยว",
			"📚 ภูมิปัญญา & ประวัติศาสตร์",
			"📰 โลกรอบตัว & ข่าวล่าสุด",
		}
		for _, name := range defaults {
			s.AddCategory(name)
		}
	} else {
		log.Printf("Loaded %d categories from Firestore.", len(loadedCats))
	}
}

func (s *Service) loadCards() {
	log.Println("Loading cards from Firestore...")
	iter := s.client.Collection("cards").Documents(s.ctx)
	var loadedCards []GameCard
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Failed to iterate cards: %v", err)
			return
		}
		var card GameCard
		if err := doc.DataTo(&card); err != nil {
			log.Printf("Failed to parse card data: %v", err)
			continue
		}
		loadedCards = append(loadedCards, card)
	}

	if len(loadedCards) == 0 {
		log.Println("No cards found in Firestore.")
	} else {
		log.Printf("Loaded %d cards from Firestore.", len(loadedCards))
		s.cards = loadedCards
	}
}

func (s *Service) GetAll() []GameCard {
	return s.cards
}

func (s *Service) GetByCategory(category string) *GameCard {
	var filtered []GameCard
	for _, c := range s.cards {
		if c.Category == category {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		return s.GetRandom()
	}

	rand.Seed(time.Now().UnixNano())
	return &filtered[rand.Intn(len(filtered))]
}

func (s *Service) GetRandom() *GameCard {
	if len(s.cards) == 0 {
		return nil
	}
	rand.Seed(time.Now().UnixNano())
	return &s.cards[rand.Intn(len(s.cards))]
}

func (s *Service) GetCategories() []Category {
	return s.categories
}

func (s *Service) AddCategory(name string) error {
	for _, c := range s.categories {
		if c.Name == name {
			// Already exists
			return nil
		}
	}
	
	newCat := Category{
		ID:   uuid.NewString(),
		Name: name,
	}
	
	_, err := s.client.Collection("categories").Doc(newCat.ID).Set(s.ctx, newCat)
	if err != nil {
		return err
	}
	s.categories = append(s.categories, newCat)
	return nil
}

func (s *Service) GetByDifficulty(difficulty Difficulty) *GameCard {
	var filtered []GameCard
	for _, c := range s.cards {
		if c.Difficulty == difficulty {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		return nil
	}

	rand.Seed(time.Now().UnixNano())
	return &filtered[rand.Intn(len(filtered))]
}

func (s *Service) GetByCategoryAndDifficulty(category string, difficulty string) *GameCard {
	return s.GetByCategoryAndDifficultyExclude(category, difficulty, nil)
}

// GetByCategoryAndDifficultyExclude returns a random card matching category and difficulty, excluding specified IDs
func (s *Service) GetByCategoryAndDifficultyExclude(category string, difficulty string, excludeIDs []string) *GameCard {
	excludeMap := make(map[string]bool)
	for _, id := range excludeIDs {
		excludeMap[id] = true
	}

	var filtered []GameCard
	for _, c := range s.cards {
		if c.Category == category && string(c.Difficulty) == difficulty && !excludeMap[c.ID] {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		return nil
	}

	rand.Seed(time.Now().UnixNano())
	return &filtered[rand.Intn(len(filtered))]
}

// GetByCategoryExclude returns a random card from the category, excluding specified IDs
func (s *Service) GetByCategoryExclude(category string, excludeIDs []string) *GameCard {
	excludeMap := make(map[string]bool)
	for _, id := range excludeIDs {
		excludeMap[id] = true
	}

	var filtered []GameCard
	for _, c := range s.cards {
		if c.Category == category && !excludeMap[c.ID] {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		return s.GetRandomExclude(excludeIDs)
	}

	rand.Seed(time.Now().UnixNano())
	return &filtered[rand.Intn(len(filtered))]
}

// GetRandomExclude returns a random card excluding specified IDs
func (s *Service) GetRandomExclude(excludeIDs []string) *GameCard {
	excludeMap := make(map[string]bool)
	for _, id := range excludeIDs {
		excludeMap[id] = true
	}

	var filtered []GameCard
	for _, c := range s.cards {
		if !excludeMap[c.ID] {
			filtered = append(filtered, c)
		}
	}

	if len(filtered) == 0 {
		// All cards used, fall back to allowing duplicates
		return s.GetRandom()
	}

	rand.Seed(time.Now().UnixNano())
	return &filtered[rand.Intn(len(filtered))]
}

func (s *Service) DeleteByCategory(categoryName string) {
	// First update local state
	var keptCards []GameCard
	for _, c := range s.cards {
		if c.Category != categoryName {
			keptCards = append(keptCards, c)
		} else {
			_, err := s.client.Collection("cards").Doc(c.ID).Delete(s.ctx)
			if err != nil {
				log.Printf("Failed to delete card %s from Firestore: %v", c.ID, err)
			}
		}
	}
	s.cards = keptCards

	// Delete Category from collection
	var keptCats []Category
	for _, cat := range s.categories {
		if cat.Name != categoryName {
			keptCats = append(keptCats, cat)
		} else {
			_, err := s.client.Collection("categories").Doc(cat.ID).Delete(s.ctx)
			if err != nil {
				log.Printf("Failed to delete category %s from Firestore: %v", cat.ID, err)
			}
		}
	}
	s.categories = keptCats
}

func (s *Service) UpdateCategory(oldCategoryName, newCategoryName string) {
	// 1. Update Category
	var catID string
	for i := range s.categories {
		if s.categories[i].Name == oldCategoryName {
			s.categories[i].Name = newCategoryName
			catID = s.categories[i].ID
			_, err := s.client.Collection("categories").Doc(catID).Set(s.ctx, s.categories[i])
			if err != nil {
				log.Printf("Failed to update category %s in Firestore: %v", catID, err)
			}
			break
		}
	}

	// 2. Update all Cards
	for i := range s.cards {
		if s.cards[i].Category == oldCategoryName {
			s.cards[i].Category = newCategoryName
			if catID != "" {
				s.cards[i].CategoryID = catID
			}
			_, err := s.client.Collection("cards").Doc(s.cards[i].ID).Set(s.ctx, s.cards[i])
			if err != nil {
				log.Printf("Failed to update card %s in Firestore: %v", s.cards[i].ID, err)
			}
		}
	}
}

func (s *Service) AddCard(card GameCard) {
    if card.ID == "" {
        card.ID = uuid.NewString()
    }
    // Link ID if missing but name present
    if card.CategoryID == "" && card.Category != "" {
    	for _, cat := range s.categories {
    		if cat.Name == card.Category {
    			card.CategoryID = cat.ID
    			break
    		}
    	}
    }
    
	_, err := s.client.Collection("cards").Doc(card.ID).Set(s.ctx, card)
	if err != nil {
		log.Printf("Failed to add card to Firestore: %v", err)
		return 
	}
	s.cards = append(s.cards, card)
}

func (s *Service) DeleteCard(id string) {
	var kept []GameCard
	found := false
	for _, c := range s.cards {
		if c.ID != id {
			kept = append(kept, c)
		} else {
			found = true
		}
	}
	s.cards = kept
	
	if found {
		_, err := s.client.Collection("cards").Doc(id).Delete(s.ctx)
		if err != nil {
			log.Printf("Failed to delete card from Firestore: %v", err)
		}
	}
}

func (s *Service) UpdateCard(id string, updatedCard GameCard) bool {
	for i, c := range s.cards {
		if c.ID == id {
			// Preserve ID if not provided in updatedCard
			if updatedCard.ID == "" {
				updatedCard.ID = id
			}
			s.cards[i] = updatedCard
			
			_, err := s.client.Collection("cards").Doc(id).Set(s.ctx, updatedCard)
			if err != nil {
				log.Printf("Failed to update card in Firestore: %v", err)
			}
			return true
		}
	}
	return false
}
