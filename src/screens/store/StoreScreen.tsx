import React from "react";
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";
import Card from "@/components/common/Card";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { usePetContext } from "@/context/PetContext";

/**
 * Placeholder de la sección de tienda (e-commerce). En una siguiente
 * iteración se conectará a un catálogo real (Supabase o proveedor externo)
 * y a un carrito/checkout.
 */
interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
}

const PLACEHOLDER_PRODUCTS: Product[] = [
  { id: "1", name: "Alimento Premium Adulto 15kg", price: "$45.990", category: "Alimento" },
  { id: "2", name: "Antiparasitario en Pipeta", price: "$8.990", category: "Salud" },
  { id: "3", name: "Cama Ortopédica L", price: "$32.500", category: "Accesorios" },
  { id: "4", name: "Shampoo Hipoalergénico", price: "$6.490", category: "Higiene" },
  { id: "5", name: "Correa Retráctil 5m", price: "$12.990", category: "Accesorios" },
  { id: "6", name: "Snacks Dentales x20", price: "$5.990", category: "Alimento" },
];

export default function StoreScreen() {
  const { events } = usePetContext();
  // Solo se muestra el botón "Comprar" para eventos que traen un
  // affiliateUrl configurado (preparado para futura monetización).
  const recommendedEvents = events.filter((event) => !!event.affiliateUrl);

  function handleBuy(url: string) {
    Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={PLACEHOLDER_PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Tienda</Text>
              <Text style={styles.subtitle}>Próximamente: compra insumos para tu mascota</Text>
            </View>

            {recommendedEvents.length > 0 ? (
              <View style={styles.recommendedSection}>
                <Text style={styles.recommendedTitle}>Recomendado para tus eventos</Text>
                {recommendedEvents.map((event) =>
                  event.affiliateUrl ? (
                    <Card key={event.id} style={styles.recommendedCard}>
                      <View style={styles.recommendedIconWrapper}>
                        <ShoppingBag size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.recommendedContent}>
                        <Text style={styles.recommendedEventTitle} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text style={styles.recommendedEventMeta}>{event.category}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => handleBuy(event.affiliateUrl as string)}
                      >
                        <Text style={styles.buyButtonText}>Comprar</Text>
                      </TouchableOpacity>
                    </Card>
                  ) : null
                )}
              </View>
            ) : null}

            <Text style={styles.catalogTitle}>Catálogo</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.productImage}>
              <ShoppingBag size={28} color={Colors.primary} />
            </View>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addToCartButton} disabled>
              <Text style={styles.addToCartText}>Próximamente</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xs, paddingTop: Spacing.sm },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  recommendedSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  recommendedTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recommendedCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  recommendedIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  recommendedEventTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  recommendedEventMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  buyButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.xs,
  },
  catalogTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  list: { padding: Spacing.sm, paddingBottom: Spacing.xxl },
  column: { gap: Spacing.sm },
  productCard: {
    flex: 1,
    margin: Spacing.xs,
  },
  productImage: {
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  productCategory: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 2,
    minHeight: 34,
  },
  productPrice: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  addToCartButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: "600",
  },
});
